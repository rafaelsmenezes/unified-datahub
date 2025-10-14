import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class UnifiedData extends Document {
  @Prop({ required: true }) source: string;
  @Prop({ required: true }) externalId: string;
  @Prop() name?: string;
  @Prop() city?: string;
  @Prop() country?: string;
  @Prop() availability?: boolean;
  @Prop() pricePerNight?: number;
  @Prop() priceSegment?: string;
  @Prop({ type: Object }) raw?: Record<string, any>;
}

export const UnifiedDataSchema = SchemaFactory.createForClass(UnifiedData);
UnifiedDataSchema.index({ city: 1 });
UnifiedDataSchema.index({ pricePerNight: 1 });
UnifiedDataSchema.index({ availability: 1 });
UnifiedDataSchema.index({ name: 'text' });
