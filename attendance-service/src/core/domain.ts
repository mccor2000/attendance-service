export interface ICreateAttendance {
    type: AttendanceType,
    timestamp: number,
    temperature: number,
    image: string,
    userId: string,
    schoolId: string,
}

export enum AttendanceType {
    CHECKIN = 'checkin',
    CHECKOUT = 'checkout',
}

export type Attendance = {
    userId: string,
    schoolId: string,
    type: AttendanceType,
    image: string,
    temperature: number,
    timestamp: number,
}

export abstract class DomainException {
    public message: string;
}

export class UserAlreadyCheckedInException extends DomainException {
    constructor() {
        super()
        this.message = 'User already checked in'
    }
} 

export class UserAlreadyCheckedOutException extends DomainException {
    constructor() {
        super()
        this.message = 'User already checked out'
    }
} 

export class UserHaveNotCheckedInException extends DomainException {
    constructor() {
        super()
        this.message = 'User haven\'t checked in'
    }
} 