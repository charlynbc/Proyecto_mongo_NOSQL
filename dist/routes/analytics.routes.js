"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const router = (0, express_1.Router)();
// POST /analytics/canasta
router.post("/canasta", analytics_controller_1.compararCanasta);
exports.default = router;
