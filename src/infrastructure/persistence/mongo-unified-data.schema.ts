// src/infrastructure/persistence/mongo-unified-data.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class MongoUnifiedData extends Document {
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

export const MongoUnifiedDataSchema =
  SchemaFactory.createForClass(MongoUnifiedData);

// Indexes for fast filtering
MongoUnifiedDataSchema.index({ city: 1 });
MongoUnifiedDataSchema.index({ pricePerNight: 1 });
MongoUnifiedDataSchema.index({ availability: 1 });
MongoUnifiedDataSchema.index({ name: 'text' });
