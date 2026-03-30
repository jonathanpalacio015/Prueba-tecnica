const express = require('express');
const router = express.Router();
const controller = require('../controllers/empleados.controller');
const validateEmpleado = require('../middlewares/validateEmpleado');

router.get('/', controller.listar);
router.get('/count', controller.contar);
router.get('/:id', controller.obtener);
router.post('/', validateEmpleado, controller.crear);
router.put('/:id', validateEmpleado, controller.actualizar);
router.delete('/:id', controller.eliminar);

module.exports = router;
