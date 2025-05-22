import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

@Schema()
export class Event extends Document {
  @Prop()
  type: string;

  @Prop({ index: true })
  name: string;

  @Prop(SchemaTypes.Mixed)
  payload: Record<string, any>;
}

export const EventSchema = SchemaFactory.createForClass(Event);
EventSchema.index({ name: 1, type: -1 }); // asc order for name, desc order for type
