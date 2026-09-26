const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Pill = require('../models/Pill');
const authMiddleware = require('../middleware/auth');
const { TOLERANCIA_MS, ensureUpcomingTasks } = require('../services/taskScheduler');

// Última vez que el Arduino pidió una tarea (en memoria: se reinicia con el servidor)
let ultimaConexionArduino = null;

// 1. ENDPOINT PARA EL ARDUINO — sin auth, deliberadamente
router.get('/next', async (req, res) => {
  try {
    ultimaConexionArduino = new Date();
    await ensureUpcomingTasks();

    // Solo tomas que ya tocan y que siguen dentro de la tolerancia
    const now = new Date();
    const task = await Task.findOneAndUpdate(
      { status: 'pending', scheduledTime: { $lte: now, $gte: new Date(now.getTime() - TOLERANCIA_MS) } },
      { status: 'completed', dispensedAt: now },
      { sort: { scheduledTime: 1 }, new: true }
    ).populate('pacienteId pastillaId');

    if (!task) {
      return res.status(200).json({ message: 'No hay tareas pendientes', task: null });
    }

    // Inventario: descuenta las pastillas entregadas (nunca baja de 0)
    await Pill.updateOne(
      { _id: task.pastillaId?._id ?? task.pastillaId },
      [{ $set: { stockActual: { $max: [0, { $subtract: ['$stockActual', task.cantidad] }] } } }],
      { updatePipeline: true }
    );

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

// 2. Crear tarea — protegido
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

// 3. Estado del dispensador — protegido
router.get('/estado', authMiddleware, (req, res) => {
  res.status(200).json({ ultimaConexion: ultimaConexionArduino });
});

// 4. Historial — protegido. Con ?desde=&hasta= (ISO) devuelve las de ese rango por hora programada
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
