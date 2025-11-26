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
const express_1 = require("express");
const Comercio_1 = __importDefault(require("../models/Comercio"));
const router = (0, express_1.Router)();
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
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comercios = yield Comercio_1.default.find();
        res.json(comercios);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener comercios' });
    }
}));
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
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comercio = new Comercio_1.default(req.body);
        yield comercio.save();
        res.status(201).json(comercio);
    }
    catch (error) {
        res.status(400).json({ message: 'Error al crear comercio' });
    }
}));
exports.default = router;
