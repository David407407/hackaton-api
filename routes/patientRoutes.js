const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const patients = await Patient.find().populate('pastillas');
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pacientes', details: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre, edad, genero, colorTarjeta, porcentajeAdherencia, pastillas } = req.body;

    const newPatient = new Patient({
      nombre,
      edad,
      genero,
      colorTarjeta,
      porcentajeAdherencia: porcentajeAdherencia || 100,
      pastillas: pastillas || []
    });

    await newPatient.save();
    res.status(201).json({ message: 'Paciente registrado con éxito', patient: newPatient });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar paciente', details: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('pastillas');

    res.status(200).json({ message: 'Paciente actualizado', patient: updatedPatient });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar paciente', details: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Paciente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar paciente', details: error.message });
  }
});

module.exports = router;