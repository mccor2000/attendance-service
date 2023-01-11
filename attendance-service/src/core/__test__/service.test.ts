import { AttendanceType, ICreateAttendance, UserAlreadyCheckedInException, UserAlreadyCheckedOutException, UserHaveNotCheckedInException } from "../domain"
import { IRepo } from "../ports"
import { createAttendance } from "../services"

const repoFactory = jest.fn(() => ({
    isCheckedIn: jest.fn(),
    isCheckedOut: jest.fn(),
    save: jest.fn()
}))

describe('Domain Service', () => {
    const repo = repoFactory()

    test('User checks in failed if alreaedy checked in', async () => {
        repo.isCheckedIn.mockResolvedValue(true)

        try {
            await createAttendance(repo, { type: AttendanceType.CHECKIN } as ICreateAttendance)
        } catch (e) {
            expect(e).toBeInstanceOf(UserAlreadyCheckedInException)
        }
    })

    test('User checks out failed if alreaedy checked out', async () => {
        repo.isCheckedOut.mockResolvedValue(true)

        try {
            await createAttendance(repo, { type: AttendanceType.CHECKOUT} as ICreateAttendance)
        } catch (e) {
            expect(e).toBeInstanceOf(UserAlreadyCheckedOutException)
        }
    })

    test('User checks out failed if have not checked in', async () => {
        repo.isCheckedIn.mockResolvedValue(false)

        try {
            await createAttendance(repo, { type: AttendanceType.CHECKOUT} as ICreateAttendance)
        } catch (e) {
            expect(e).toBeInstanceOf(UserHaveNotCheckedInException)
        }
    })

    test('User checks in successfully',async () => {
        repo.isCheckedIn.mockResolvedValue(false)

        const input = {type: AttendanceType.CHECKIN} as ICreateAttendance

        const attd = await createAttendance(repo, input)
        expect(attd).toBeDefined()
    })

    test('User checks out successfully', async () => {
        repo.isCheckedIn.mockResolvedValue(true)
        repo.isCheckedOut.mockResolvedValue(false)

        const input = {type: AttendanceType.CHECKOUT} as ICreateAttendance

        const attd = await createAttendance(repo, input)
        expect(attd).toBeDefined()
    })
})