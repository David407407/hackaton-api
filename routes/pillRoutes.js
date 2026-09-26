const express = require('express');
const router = express.Router();
const Pill = require('../models/Pill');

// GET: Obtener todas las pastillas
router.get('/', async (req, res) => {
  try {
    const pills = await Pill.find();
    res.status(200).json(pills);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pastillas', details: error.message });
  }
});

// POST: Crear una pastilla suelta
router.post('/', async (req, res) => {
  try {
    const { nombre, dosis, fechaInicio, recurrencia } = req.body;
    const newPill = new Pill({ nombre, dosis, fechaInicio, recurrencia });
    await newPill.save();
    res.status(201).json({ message: 'Pastilla creada con éxito', pill: newPill });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear pastilla', details: error.message });
  }
});

// DELETE: Eliminar pastilla por ID
router.delete('/:id', async (req, res) => {
  try {
    await Pill.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Pastilla eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar pastilla', details: error.message });
  }
});

module.exports = router;
