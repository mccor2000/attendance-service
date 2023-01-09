import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";

export type UserDocument = HydratedDocument<User>

@Schema({ collection: 'users' })
export class User {
    @Prop({ required: true })
    name: string

    @Prop({ default: [] })
    attendances: {
        type: string,
        timestamp: number,
        temperature: number,
        picture: string,
    }[]

    @Prop({ type: SchemaTypes.ObjectId, ref: 'School'})
    schoolId: string
}

export const UserSchema = SchemaFactory.createForClass(User)