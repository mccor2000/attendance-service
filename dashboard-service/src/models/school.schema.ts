import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type SchoolDocument = HydratedDocument<School>

@Schema({ collection: 'schools' })
export class School {
    @Prop()
    name: string

    @Prop({ type: Object })
    todayReport: {
        totalCheckIns: number,
        totalCheckOuts: number,
        totalFeversDetect: number
    }
}

export const SchoolSchema = SchemaFactory.createForClass(School)