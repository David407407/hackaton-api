const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Assignment = require('../models/Assignment');
const Task = require('../models/Task');
const authMiddleware = require('../middleware/auth');

// Regla: cada tarjeta física pertenece a un solo paciente
async function cardOwner(colorTarjeta, exceptId) {
  if (!colorTarjeta) return null;
  const filter = { colorTarjeta };
  if (exceptId) filter._id = { $ne: exceptId };
  return Patient.findOne(filter).select('nombre');
}

function cardTakenResponse(res, colorTarjeta, owner) {
  const message = `La tarjeta ${colorTarjeta} ya está asignada a ${owner.nombre}.`;
  return res.status(409).json({ error: message, fields: { colorTarjeta: message } });
}

function saveErrorStatus(error) {
  return error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500;
}

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
    const { nombre, edad, genero, colorTarjeta, avatar, porcentajeAdherencia, pastillas } = req.body;

    const owner = await cardOwner(colorTarjeta);
    if (owner) return cardTakenResponse(res, colorTarjeta, owner);

    const newPatient = new Patient({
      nombre,
      edad,
      genero,
      colorTarjeta,
      avatar,
      porcentajeAdherencia: porcentajeAdherencia || 100,
      pastillas: pastillas || []
    });

    await newPatient.save();
    res.status(201).json({ message: 'Paciente registrado con éxito', patient: newPatient });
  } catch (error) {
    res.status(saveErrorStatus(error)).json({ error: 'Error al registrar paciente', details: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const owner = await cardOwner(req.body.colorTarjeta, req.params.id);
    if (owner) return cardTakenResponse(res, req.body.colorTarjeta, owner);

    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('pastillas');

    res.status(200).json({ message: 'Paciente actualizado', patient: updatedPatient });
  } catch (error) {
    res.status(saveErrorStatus(error)).json({ error: 'Error al actualizar paciente', details: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Patient.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Ese paciente ya no existe' });

    // En cascada: sus asignaciones (se devuelven para poder deshacer)
    const asignaciones = await Assignment.find({ pacienteId: deleted._id });
    await Assignment.deleteMany({ pacienteId: deleted._id });
    await Task.deleteMany({ pacienteId: deleted._id, status: 'pending' });

    res.status(200).json({ message: 'Paciente eliminado correctamente', asignaciones });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar paciente', details: error.message });
  }
});

module.exports = router;