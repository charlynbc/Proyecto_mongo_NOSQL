import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProducto extends Document {
  nombre: string;
  marca: string;
  categoria?: Types.ObjectId;     // referencia
  categoriaNombre?: string;       // nombre “humano”
  atributos?: Record<string, any>;
  variantes?: any[];
}

const ProductoSchema: Schema = new Schema({
  nombre: { type: String, required: true, trim: true },
  marca:  { type: String, required: true, trim: true },

  // referencia a Categoria
  categoria: {
    type: Schema.Types.ObjectId,
    ref: "Categoria"
  },

  // cache del nombre para búsquedas rápidas / front simple
  categoriaNombre: {
    type: String,
    trim: true
  },

  atributos: {
    type: Schema.Types.Mixed,
    default: {}
  },

  variantes: {
    type: [Schema.Types.Mixed],
    default: []
  }
}, { timestamps: true });

ProductoSchema.index({ nombre: 'text', marca: 'text' });
ProductoSchema.index({ categoria: 1, marca: 1 });

export default mongoose.model<IProducto>('Producto', ProductoSchema);