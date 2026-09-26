const express = require('express');
const router = express.Router();
const Pill = require('../models/Pill');
const Patient = require('../models/Patient');
const Assignment = require('../models/Assignment');
const Task = require('../models/Task');
const authMiddleware = require('../middleware/auth');
const { syncPillTasks } = require('../services/taskScheduler');

const EDITABLE_FIELDS = ['nombre', 'dosis', 'forma', 'slotCompartimento', 'stockActual', 'stockMinimoAlerta', 'capacidad', 'notas', 'fechaInicio', 'recurrencia'];

function pickEditable(body) {
  return Object.fromEntries(EDITABLE_FIELDS.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]));
}

// Regla: cada compartimento del dispensador guarda como máximo una pastilla
async function slotOwner(slotCompartimento, exceptId) {
  if (slotCompartimento == null) return null;
  const filter = { slotCompartimento };
  if (exceptId) filter._id = { $ne: exceptId };
  return Pill.findOne(filter).select('nombre dosis');
}

function slotTakenResponse(res, slotCompartimento, owner) {
  const message = `C${slotCompartimento} ya tiene ${owner.nombre} ${owner.dosis}.`;
  return res.status(409).json({ error: message, fields: { slotCompartimento: message } });
}

function saveErrorStatus(error) {
  return error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500;
}

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
    const data = pickEditable(req.body);

    const owner = await slotOwner(data.slotCompartimento);
    if (owner) return slotTakenResponse(res, data.slotCompartimento, owner);

    const newPill = new Pill(data);

    await newPill.save();
    res.status(201).json({ message: 'Pastilla creada con éxito', pill: newPill });
  } catch (error) {
    res.status(saveErrorStatus(error)).json({ error: 'Error al crear pastilla', details: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const data = pickEditable(req.body);

    const owner = await slotOwner(data.slotCompartimento, req.params.id);
    if (owner) return slotTakenResponse(res, data.slotCompartimento, owner);

    const updatedPill = await Pill.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!updatedPill) return res.status(404).json({ error: 'Esa pastilla ya no existe' });
    // Si cambió de compartimento, las tareas pendientes apuntan al motor nuevo
    await syncPillTasks(updatedPill._id);

    res.status(200).json({ message: 'Pastilla actualizada', pill: updatedPill });
  } catch (error) {
    res.status(saveErrorStatus(error)).json({ error: 'Error al actualizar pastilla', details: error.message });
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
    // No se borra si algún paciente la tiene asignada
    const patients = await Patient.find({ pastillas: req.params.id }).select('_id');
    if (patients.length) {
      const count = patients.length;
      return res.status(409).json({
        error: `Está asignada a ${count} ${count === 1 ? 'paciente' : 'pacientes'}. Quita la asignación primero.`,
        patientIds: patients.map((patient) => patient._id)
      });
    }

    const deleted = await Pill.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Esa pastilla ya no existe' });
    // Las asignaciones pausadas de esta pastilla se van con ella
    await Assignment.deleteMany({ pastillaId: deleted._id });
    await Task.deleteMany({ pastillaId: deleted._id, status: 'pending' });
res.status(200).json({ message: 'Pastilla eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar pastilla', details: error.message });
  }
});

module.exports = router;