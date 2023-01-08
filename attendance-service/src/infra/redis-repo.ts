import Redis from 'ioredis'

import { IRepo } from "../core/ports";
import { Attendance, AttendanceType } from '../core/domain';


export class AttendanceRepo implements IRepo {
    constructor(private readonly client: Redis) { }

    async isCheckedIn(userId: string, schoolId: string): Promise<boolean> {
        return await this.client.exists(`${AttendanceType.CHECKIN}:${schoolId}:${userId}`) === 1
    }

    async isCheckedOut(userId: string, schoolId: string): Promise<boolean> {
        return await this.client.exists(`${AttendanceType.CHECKOUT}:${schoolId}:${userId}`) === 1
    }

    async save(data: Attendance) {
        await this.client.set(this.key(data), this.value(data))
    }

    private key({ type, schoolId, userId }: Attendance) {
        return `${type}:${schoolId}:${userId}`
    }

    private value({ timestamp, temperature }: Attendance) {
        return `${timestamp}:${temperature}`
    }
}