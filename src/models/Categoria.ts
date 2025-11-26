import { Schema, model, Document } from "mongoose";

export interface ICategoria extends Document {
  nombre: string;
  slug: string;
  descripcion?: string;
}

const categoriaSchema = new Schema<ICategoria>(
  {
    nombre: { type: String, required: true, unique: true, trim: true },
    slug:   { type: String, required: true, unique: true, lowercase: true, trim: true },
    descripcion: { type: String }
  },
  {
    timestamps: true
  }
);

export const Categoria = model<ICategoria>("Categoria", categoriaSchema);