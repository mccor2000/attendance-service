import Redis from 'ioredis'

import { IRepo } from "../core/ports";
import { Attendance, AttendanceType } from '../core/domain';
import { Bulk } from '../utils/bulk';
import { parseKeyField } from '../utils/parse-key';

export type Record = { key: string, field: string, value: any }

export class AttendanceRepo implements IRepo {
    private bulk: Bulk<Record>

    constructor(private readonly client: Redis) {
        this.bulk = new Bulk(1000, 5 * 1000, this.pipeline.bind(this))
    }

    async isCheckedIn(userId: string): Promise<boolean> {
        const [key, field] = parseKeyField(`${AttendanceType.CHECKIN}:${userId}`)
        return (await this.client.hexists(key, field)) === 1
    }

    async isCheckedOut(userId: string): Promise<boolean> {
        const [key, field] = parseKeyField(`${AttendanceType.CHECKOUT}:${userId}`)
        return (await this.client.hexists(key, field)) === 1
    }

    async save(data: Attendance) {
        const [key, field] = parseKeyField(`${data.type}:${data.userId}`)

        this.bulk.push({
            key,
            field,
            value: true
        })
    }

    private async pipeline(records: Record[]) {
        const pipeline = this.client.pipeline()
        records.forEach(r => {
            pipeline.hset(r.key, r.field, r.value)
        });

        await pipeline.exec()
    }
}
