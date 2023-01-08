export interface IRepo {
    isCheckedIn(userId: string, schoolId: string): Promise<boolean>
    isCheckedOut(userId: string, schoolId: string): Promise<boolean>
    save(attendance: any): Promise<void>
}

export interface IPublisher {
    produce(message: string): Promise<void>
}