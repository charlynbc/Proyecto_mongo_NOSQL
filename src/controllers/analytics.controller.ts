import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import Precio from "../models/Precio";

export async function compararCanasta(req: Request, res: Response, next: NextFunction) {
  try {
    const { productos } = req.body;

    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ message: "Debe enviar un array de IDs de productos en 'productos'" });
    }

    const productoIds = productos
      .filter((id: string) => Types.ObjectId.isValid(id))
      .map((id: string) => new Types.ObjectId(id));

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

    const resultados = await Precio.aggregate(pipeline);

    return res.json({
      productos: productoIds,
      resultados
    });
  } catch (err) {
    next(err);
  }
}