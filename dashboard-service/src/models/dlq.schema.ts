import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type DLQDocument = HydratedDocument<DLQ>

@Schema({ collection: 'dlq' })
export class DLQ {
    @Prop()
    type: string

    @Prop({ type: Object })
    data: any
}

export const DLQSchema = SchemaFactory.createForClass(DLQ)