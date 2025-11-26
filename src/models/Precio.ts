import mongoose, { Schema, Document } from 'mongoose';

export interface IPrecio extends Document {
  producto: mongoose.Types.ObjectId;
  comercio: mongoose.Types.ObjectId;
  precio: number;
  moneda: string;
  promo: string;
  fecha: Date;
}

const PrecioSchema: Schema = new Schema({
  producto: { type: Schema.Types.ObjectId, ref: 'Producto', required: true },
  comercio: { type: Schema.Types.ObjectId, ref: 'Comercio', required: true },
  precio: { type: Number, required: true },
  moneda: { type: String, default: 'UYU' },
  promo: { type: String, default: 'ninguna' },
  fecha: { type: Date, default: Date.now },
});

export default mongoose.model<IPrecio>('Precio', PrecioSchema);