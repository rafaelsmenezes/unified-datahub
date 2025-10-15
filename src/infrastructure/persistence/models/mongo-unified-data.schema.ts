import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class MongoUnifiedData extends Document {
  @Prop({ required: true, index: true }) source!: string;
  @Prop({ required: true, index: true }) externalId!: string;
  @Prop({ index: 'text' }) name?: string;
  @Prop({ index: true }) city?: string;
  @Prop() country?: string;
  @Prop({ index: true }) availability?: boolean;
  @Prop({ index: true }) pricePerNight?: number;
  @Prop() priceSegment?: string;
  @Prop({ type: Object }) raw?: Record<string, any>;

  createdAt!: Date;
  updatedAt!: Date;
}

export const MongoUnifiedDataSchema =
  SchemaFactory.createForClass(MongoUnifiedData);

// Compound unique index for idempotent ingestion
MongoUnifiedDataSchema.index({ source: 1, externalId: 1 }, { unique: true });
