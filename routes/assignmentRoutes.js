const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Patient = require('../models/Patient');
const Pill = require('../models/Pill');
const Task = require('../models/Task');
const authMiddleware = require('../middleware/auth');
const { syncAssignmentTasks } = require('../services/taskScheduler');

router.use(authMiddleware);

const EDITABLE_FIELDS = ['pastillaId', 'cantidad', 'horas', 'frecuencia', 'dias', 'fechaInicio', 'fechaFin', 'indicaciones', 'activa'];

function pickEditable(body) {
  return Object.fromEntries(EDITABLE_FIELDS.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]));
}

function saveErrorStatus(error) {
  return error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500;
}

// Regla: un paciente no puede tener la misma pastilla activa dos veces
async function assertAssignable(res, { pacienteId, pastillaId, activa }, exceptId) {
  const [patient, pill] = await Promise.all([
    Patient.findById(pacienteId).select('nombre'),
    Pill.findById(pastillaId).select('nombre dosis')
  ]);
  if (!patient) {
    res.status(400).json({ error: 'Ese paciente ya no existe', fields: { pacienteId: 'Ese paciente ya no existe.' } });
    return false;
  }
  if (!pill) {
    res.status(400).json({ error: 'Esa pastilla ya no existe', fields: { pastillaId: 'Esa pastilla ya no existe.' } });
    return false;
  }
  if (activa === false) return true;

  const filter = { pacienteId, pastillaId, activa: true };
  if (exceptId) filter._id = { $ne: exceptId };
  if (await Assignment.exists(filter)) {
    const message = `${patient.nombre} ya tiene ${pill.nombre} ${pill.dosis} activo.`;
    res.status(409).json({ error: message, fields: { pastillaId: message } });
    return false;
  }
  return true;
}

// GET: todas las asignaciones, o las de un paciente con ?pacienteId=
router.get('/', async (req, res) => {
  try {
    const filter = req.query.pacienteId ? { pacienteId: req.query.pacienteId } : {};
    const assignments = await Assignment.find(filter).sort({ createdAt: 1 });
    res.status(200).json(assignments);
  } catch (error) {
    res.status(saveErrorStatus(error)).json({ error: 'Error al obtener asignaciones', details: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = { ...pickEditable(req.body), pacienteId: req.body.pacienteId };
    if (!(await assertAssignable(res, data))) return;

    const newAssignment = new Assignment(data);
    await newAssignment.save();
    await Assignment.syncPatientPills(newAssignment.pacienteId);
    await syncAssignmentTasks(newAssignment._id);

    res.status(201).json({ message: 'Pastilla asignada con éxito', assignment: newAssignment });
  } catch (error) {
    res.status(saveErrorStatus(error)).json({ error: 'Error al asignar pastilla', details: error.message });
  }
});

// PUT: el paciente de una asignación no cambia
router.put('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Esa asignación ya no existe' });

    assignment.set(pickEditable(req.body));
    if (!(await assertAssignable(res, assignment, assignment._id))) return;

    await assignment.save();
    await Assignment.syncPatientPills(assignment.pacienteId);
    await syncAssignmentTasks(assignment._id);

    res.status(200).json({ message: 'Asignación actualizada', assignment });
  } catch (error) {
    res.status(saveErrorStatus(error)).json({ error: 'Error al actualizar asignación', details: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Assignment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Esa asignación ya no existe' });
    await Assignment.syncPatientPills(deleted.pacienteId);
    // Las tomas ya dispensadas se quedan en el historial
    await Task.deleteMany({ asignacionId: deleted._id, status: 'pending' });

    res.status(200).json({ message: 'Asignación eliminada', assignment: deleted });
  } catch (error) {
    res.status(saveErrorStatus(error)).json({ error: 'Error al eliminar asignación', details: error.message });
  }
});

module.exports = router;
