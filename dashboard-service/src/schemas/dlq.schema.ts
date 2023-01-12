import { Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type DLQDocument = HydratedDocument<DLQ>

@Schema({ collection: 'dlq' })
export class DLQ {}

export const DLQSchema = SchemaFactory.createForClass(DLQ)