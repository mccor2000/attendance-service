import Redis from 'ioredis'

import { IRepo } from "../core/ports";
import { Attendance, AttendanceType } from '../core/domain';
import { Bulk } from '../utils/bulk';

export type Record = { key: string, field: string, value: string }

export class AttendanceRepo implements IRepo {
    private bulk: Bulk<Record>

    constructor(private readonly client: Redis) {
        this.bulk = new Bulk(
            3000,       // buffer 1000 records and then write
            5 * 1000,   // or automatically write in 5 seconds 
            this.pipeline.bind(this)
        )
    }

    async isCheckedIn(userId: string): Promise<boolean> {
        const [key, field] = this.key({
            type: AttendanceType.CHECKIN,
            userId
        } as Attendance)
        return await this.client.hexists(key, field) === 1
    }

    async isCheckedOut(userId: string): Promise<boolean> {
        const [key, field] = this.key({
            type: AttendanceType.CHECKOUT,
            userId
        } as Attendance)
        return await this.client.hexists(key, field) === 1
    }

    async save(data: Attendance) {
        const [key, field] = this.key(data)

        this.bulk.push({
            key,
            field,
            value: this.value(data)
        })
    }

    private async pipeline(records: Record[]) {
        const pipeline = this.client.pipeline()
        records.forEach(r => {
            pipeline.hset(r.key, r.field, r.value)
        });

        const result = await pipeline.exec()

        const failedRecords = result ? result?.filter(r => r[0]) : []
        if (failedRecords.length > 0) {
            // TODO:
            // push to DLQ
            console.log('Adding to DLQ..')
        }
    }

    private key({ type, userId }: Attendance) {
        return [
            `${type}:${userId.slice(0, userId.length - 2)}`,
            userId.slice(-2)
        ]
    }

    private value({ schoolId, timestamp, temperature, image }: Attendance) {
        return `${schoolId}:${timestamp}:${image}:${temperature}`
    }
}