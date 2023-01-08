import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type SchoolDocument = HydratedDocument<School>

@Schema({ collection: 'schools' })
export class School {
    @Prop({ required: true })
    name: string

    @Prop({ default: [] })
    reports: {
        date: Date,
        present: number
        absent: number,
        totalFeversDetect: number
    }[]
}

export const SchoolSchema = SchemaFactory.createForClass(School)