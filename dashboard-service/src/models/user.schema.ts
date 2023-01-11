import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";

export type UserDocument = HydratedDocument<User>

@Schema({ collection: 'users' })
export class User {
    @Prop({ required: true })
    name: string

    @Prop({ type: SchemaTypes.ObjectId, ref: 'School', index: true})
    school: string
}

export const UserSchema = SchemaFactory.createForClass(User)