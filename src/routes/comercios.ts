import { Router } from 'express';
import Comercio from '../models/Comercio';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Comercios
 *   description: Gestión de comercios
 */

/**
 * @swagger
 * /comercios:
 *   get:
 *     summary: Obtener todos los comercios
 *     tags: [Comercios]
 *     responses:
 *       200:
 *         description: Lista de comercios
 */
router.get('/', async (req, res) => {
  try {
    const comercios = await Comercio.find();
    res.json(comercios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener comercios' });
  }
});

/**
 * @swagger
 * /comercios:
 *   post:
 *     summary: Crear un comercio
 *     tags: [Comercios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               direccion:
 *                 type: string
 *               ubicacion:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     default: Point
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *     responses:
 *       201:
 *         description: Comercio creado
 */
router.post('/', async (req, res) => {
  try {
    const comercio = new Comercio(req.body);
    await comercio.save();
    res.status(201).json(comercio);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear comercio' });
  }
});

export default router;