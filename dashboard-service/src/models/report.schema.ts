
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

    @Prop()
    totalCheckIns: number

    @Prop()
    totalCheckOuts: number

    @Prop()
    totalFeversDetect: number
}

export const ReportSchema = SchemaFactory.createForClass(Report)