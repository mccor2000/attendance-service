import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";

export type AttendanceDocument = HydratedDocument<Attendance>

@Schema({ collection: 'attendances' })
export class Attendance {
    @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
    user: string

    @Prop({ type: Date })
    date: Date

    @Prop({ type: Object })
    checkin: {
        timestamp: number
        temperature: number
        image: string
    }

    @Prop({ type: Object })
    checkout: {
        timestamp: number
        temperature: number
        image: string
    }
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance)