const express = require('express');
const router = express.Router();
const Pill = require('../models/Pill');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const pills = await Pill.find();
    res.status(200).json(pills);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pastillas', details: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre, dosis, slotCompartimento, stockActual, stockMinimoAlerta, fechaInicio, recurrencia } = req.body;

    const newPill = new Pill({
      nombre,
      dosis,
      slotCompartimento,
      stockActual,
      stockMinimoAlerta,
      fechaInicio,
      recurrencia
    });

    await newPill.save();
    res.status(201).json({ message: 'Pastilla creada con éxito', pill: newPill });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear pastilla', details: error.message });
  }
});

router.put('/:id/stock', authMiddleware, async (req, res) => {
  try {
    const { stockActual } = req.body;
    const updatedPill = await Pill.findByIdAndUpdate(
      req.params.id,
      { stockActual },
      { new: true }
    );
    res.status(200).json({ message: 'Stock actualizado con éxito', pill: updatedPill });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar stock', details: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Pill.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Pastilla eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar pastilla', details: error.message });
  }
});

module.exports = router;