import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type SchoolDocument = HydratedDocument<School>

@Schema({ collection: 'schools' })
export class School {
    @Prop()
    name: string

    @Prop({ type: Object })
    liveReport: {
        totalCheckIns: number,
        totalCheckOuts: number,
        totalFeversDetect: number
    }

    @Prop({ default: [] })
    reports: {
        date: Date,
        totalCheckIns: number,
        totalCheckOuts: number,
        totalFeversDetect: number
    }[]
}

export const SchoolSchema = SchemaFactory.createForClass(School)