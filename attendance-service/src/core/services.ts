import { AttendanceType, ICreateAttendance, UserAlreadyCheckedInException, UserAlreadyCheckedOutException, UserHaveNotCheckedInException } from "./domain";
import { IRepo } from "./ports";

export const createAttendance = async (repo: IRepo, data: ICreateAttendance) => {
    const isCheckedIn = await repo.isCheckedIn(data.userId, data.schoolId)
    if (data.type === AttendanceType.CHECKIN && isCheckedIn) {
        throw new UserAlreadyCheckedInException()
    }
    if (data.type === AttendanceType.CHECKOUT) {
        if (!isCheckedIn) {
            throw new UserHaveNotCheckedInException()
        }
        const isCheckedOut = await repo.isCheckedOut(data.userId, data.schoolId)
        if (isCheckedOut) {
            throw new UserAlreadyCheckedOutException()
        }
    }

    return data
}