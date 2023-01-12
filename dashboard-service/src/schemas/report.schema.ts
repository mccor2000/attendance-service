import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import { SchoolDocument } from "./school.schema";

export type ReportDocument = HydratedDocument<Report>

@Schema({ collection: 'reports' })
export class Report {
    @Prop({ type: SchemaTypes.ObjectId, ref: 'School'})
    school: SchoolDocument

    @Prop({ type: Date })
    date: Date

    @Prop({ default: 0 })
    totalCheckIns: number

    @Prop({ default: 0 })
    totalCheckOuts: number

    @Prop({ default: 0 })
    totalFeversDetect: number
}

export const ReportSchema = SchemaFactory.createForClass(Report)