import { Router } from 'express';
import Producto from '../models/Producto';
import { Categoria } from '../models/Categoria';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Gestión de productos
 */

/**
 * @swagger
 * /productos:
 *   get:
 *     summary: Obtener todos los productos
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Lista de productos
 */
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

/**
 * @swagger
 * /productos:
 *   post:
 *     summary: Crear un producto
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               marca:
 *                 type: string
 *               categoriaId:
 *                 type: string
 *               atributos:
 *                 type: object
 *     responses:
 *       201:
 *         description: Producto creado
 */
router.post('/', async (req, res) => {
  try {
    const { nombre, marca, categoriaId, atributos } = req.body;

    let categoriaData;
    if (categoriaId) {
      categoriaData = await Categoria.findById(categoriaId);
      if (!categoriaData) {
        return res.status(400).json({ message: "Categoría no encontrada" });
      }
    }

    const producto = new Producto({
      nombre,
      marca,
      categoria: categoriaData?._id,
      categoriaNombre: categoriaData?.nombre,
      atributos
    });

    await producto.save();
    res.status(201).json(producto);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear producto' });
  }
});

export default router;