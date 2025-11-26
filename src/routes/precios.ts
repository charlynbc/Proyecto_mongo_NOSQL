import { Router } from 'express';
import Precio from '../models/Precio';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Precios
 *   description: Gestión de precios
 */

/**
 * @swagger
 * /precios:
 *   get:
 *     summary: Obtener todos los precios
 *     tags: [Precios]
 *     responses:
 *       200:
 *         description: Lista de precios
 */
router.get('/', async (req, res) => {
  try {
    const precios = await Precio.find().populate('comercio').populate('producto');
    res.json(precios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener precios' });
  }
});

/**
 * @swagger
 * /precios:
 *   post:
 *     summary: Crear o actualizar un precio
 *     tags: [Precios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               producto:
 *                 type: string
 *               comercio:
 *                 type: string
 *               precio:
 *                 type: number
 *               moneda:
 *                 type: string
 *               promo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Precio creado o actualizado
 */
router.post('/', async (req, res) => {
  try {
    const { producto, comercio, precio, moneda, promo } = req.body;

    const doc = await Precio.findOneAndUpdate(
      {
        comercio: comercio,
        producto: producto,
      },
      {
        comercio,
        producto,
        precio,
        moneda,
        promo,
        fecha: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(doc);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear precio' });
  }
});

export default router;