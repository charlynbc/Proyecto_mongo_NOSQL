import mongoose, { Schema, Document } from 'mongoose';

export interface IComercio extends Document {
  nombre: string;
  direccion: string;
  ubicacion: {
    type: string;
    coordinates: number[];
  };
}

const ComercioSchema: Schema = new Schema({
  nombre: { type: String, required: true },
  direccion: { type: String, required: true },
  ubicacion: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
});

ComercioSchema.index({ ubicacion: '2dsphere' });

export default mongoose.model<IComercio>('Comercio', ComercioSchema);