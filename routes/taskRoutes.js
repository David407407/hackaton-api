const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Pill = require('../models/Pill');
const Device = require('../models/Device');
const authMiddleware = require('../middleware/auth');
const { TOLERANCIA_MS, NUM_COMPARTIMENTOS, ensureUpcomingTasks } = require('../services/taskScheduler');

const DEVICE_ID = 'dispensador';

// 1. ARDUINO (sin auth, deliberadamente): pide la siguiente toma.No la da por entregada: la reserva ('dispensing') y
// espera a que el Arduino confirme. Si nunca confirma (timeout en un arranque en frío de
// Render, reinicio del ESP32), la reserva vence y la toma vuelve a pendiente.
router.get('/next', async (req, res) => {
  try {
    const now = new Date();
    await Device.updateOne({ _id: DEVICE_ID }, { ultimaConexion: now }, { upsert: true });
    await ensureUpcomingTasks();

    // Solo tomas que ya tocan, dentro de la tolerancia y para un servo que existe
    const task = await Task.findOneAndUpdate(
      {
        status: 'pending',
        scheduledTime: { $lte: now, $gte: new Date(now.getTime() - TOLERANCIA_MS) },
        slotMotor: { $gte: 1, $lte: NUM_COMPARTIMENTOS }
      },
      { status: 'dispensing', reservedAt: now, $inc: { intentos: 1 } },
      { sort: { scheduledTime: 1 }, new: true }
    ).populate('pacienteId pastillaId');

    if (!task) {
      return res.status(200).json({ message: 'No hay tareas pendientes', task: null });
    }

    res.status(200).json({
      success: true,
      task: {
        id: task._id,
        action: task.action,
        slotMotor: task.slotMotor,
        cantidad: task.cantidad,
        paciente: task.pacienteId ? task.pacienteId.nombre : 'Desconocido',
        tarjeta: task.pacienteId ? task.pacienteId.colorTarjeta : null,
        pastilla: task.pastillaId ? task.pastillaId.nombre : 'Desconocida'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar tareas', details: error.message });
  }
});

// 2. ARDUINO (sin auth): confirma que ya giró el servo.Idempotente: si el ESP32 reintenta la
// confirmación (se cortó la respuesta), el stock no se descuenta dos veces.
router.post('/:id/confirmar', async (req, res) => {
  try {
    // Se acepta aunque la reserva ya hubiera vencido: si el Arduino giró el servo, la toma se entregó
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, status: { $ne: 'completed' }, intentos: { $gte: 1 } },
      { status: 'completed', dispensedAt: new Date() },
      { new: true }
    );

    if (!task) {
      const existing = await Task.findById(req.params.id).select('status intentos');
      if (!existing) return res.status(404).json({ error: 'Esa tarea no existe' });
      if (existing.status === 'completed') return res.status(200).json({ success: true, message: 'Ya estaba confirmada' });
      return res.status(409).json({ error: 'Esa tarea nunca se entregó al dispensador' });
    }

    // Inventario: descuenta las pastillas entregadas (nunca baja de 0)
    await Pill.updateOne(
      { _id: task.pastillaId },
      [{ $set: { stockActual: { $max: [0, { $subtract: ['$stockActual', task.cantidad] }] } } }],
      { updatePipeline: true }
    );

    res.status(200).json({ success: true, message: 'Toma confirmada' });
  } catch (error) {
    const status = error.name === 'CastError' ? 404 : 500;
    res.status(status).json({ error: 'Error al confirmar la toma', details: error.message });
  }
});

// 3. Crear tarea — protegido
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { pacienteId, pastillaId, slotMotor, cantidad, scheduledTime } = req.body;

    const newTask = new Task({
      pacienteId,
      pastillaId,
      slotMotor,
      cantidad,
      scheduledTime: scheduledTime || new Date()
    });

    await newTask.save();
    res.status(201).json({ message: 'Tarea de dispensación programada con éxito', task: newTask });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la tarea', details: error.message });
  }
});

// 4. Estado del dispensador — protegido
router.get('/estado', authMiddleware, async (req, res) => {
  try {
    const device = await Device.findById(DEVICE_ID);
    res.status(200).json({ ultimaConexion: device?.ultimaConexion ?? null });
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar el dispensador', details: error.message });
  }
});

// 5. Historial— protegido. Con ?desde=&hasta= (ISO) devuelve las de ese rango por hora programada
router.get('/', authMiddleware, async (req, res) => {
  try {
    await ensureUpcomingTasks();
    const { desde, hasta } = req.query;

    const tasks = desde || hasta
      ? await Task.find({
          scheduledTime: {
            ...(desde && { $gte: new Date(desde) }),
            ...(hasta && { $lte: new Date(hasta) })
          }
        }).sort({ scheduledTime: 1 }).populate('pacienteId pastillaId')
      : await Task.find().sort({ createdAt: -1 }).limit(50).populate('pacienteId pastillaId');

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el historial de tareas', details: error.message });
  }
});

module.exports = router;
