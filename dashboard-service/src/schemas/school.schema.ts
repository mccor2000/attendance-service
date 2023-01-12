import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type SchoolDocument = HydratedDocument<School>

@Schema({ collection: 'schools' })
export class School {
    @Prop()
    name: string
}

export const SchoolSchema = SchemaFactory.createForClass(School)