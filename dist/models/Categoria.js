"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Categoria = void 0;
const mongoose_1 = require("mongoose");
const categoriaSchema = new mongoose_1.Schema({
    nombre: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    descripcion: { type: String }
}, {
    timestamps: true
});
exports.Categoria = (0, mongoose_1.model)("Categoria", categoriaSchema);
