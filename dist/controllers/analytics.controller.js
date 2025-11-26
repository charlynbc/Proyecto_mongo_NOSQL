"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compararCanasta = compararCanasta;
const mongoose_1 = require("mongoose");
const Precio_1 = __importDefault(require("../models/Precio"));
function compararCanasta(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { productos } = req.body;
            if (!Array.isArray(productos) || productos.length === 0) {
                return res.status(400).json({ message: "Debe enviar un array de IDs de productos en 'productos'" });
            }
            const productoIds = productos
                .filter((id) => mongoose_1.Types.ObjectId.isValid(id))
                .map((id) => new mongoose_1.Types.ObjectId(id));
            if (productoIds.length === 0) {
                return res.status(400).json({ message: "No se enviaron IDs de productos válidos" });
            }
            const pipeline = [
                {
                    $match: {
                        producto: { $in: productoIds }
                    }
                },
                {
                    $group: {
                        _id: "$comercio",
                        totalCanasta: { $sum: "$precio" },
                        items: {
                            $push: {
                                producto: "$producto",
                                precio: "$precio"
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "comercios",
                        localField: "_id",
                        foreignField: "_id",
                        as: "comercio"
                    }
                },
                { $unwind: "$comercio" },
                {
                    $lookup: {
                        from: "productos",
                        localField: "items.producto",
                        foreignField: "_id",
                        as: "productosDetalle"
                    }
                },
                {
                    $sort: {
                        totalCanasta: 1
                    }
                }
            ];
            const resultados = yield Precio_1.default.aggregate(pipeline);
            return res.json({
                productos: productoIds,
                resultados
            });
        }
        catch (err) {
            next(err);
        }
    });
}
