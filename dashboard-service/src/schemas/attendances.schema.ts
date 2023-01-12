import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";

export type AttendanceDocument = HydratedDocument<Attendance>

export enum AttendanceType {
    CHECKIN = 'checkin',
    CHECKOUT = 'checkout',
}

@Schema({ collection: 'attendances' })
export class Attendance {
    @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
    user: string

    @Prop({ type: Date })
    date: Date

    @Prop({ type: Object })
    [AttendanceType.CHECKIN]: {
        timestamp: number
        temperature: number
        image: string
    }

    @Prop({ type: Object })
    [AttendanceType.CHECKOUT]: {
        timestamp: number
        temperature: number
        image: string
    }
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance)