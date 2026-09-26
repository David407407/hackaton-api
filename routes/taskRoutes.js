const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// 1. ENDPOINT PARA EL ARDUINO: Consultar si hay una pastilla que dispensar ahora
router.get('/next', async (req, res) => {
  try {
    // Busca la primera tarea pendiente ordenada por la hora programada más próxima
    const task = await Task.findOneAndUpdate(
      { status: 'pending' },
      { status: 'completed' }, // La consumimos de inmediato para que el Arduino no la repita
      { sort: { scheduledTime: 1 }, new: true }
    ).populate('pacienteId pastillaId');

    if (!task) {
      return res.status(200).json({ 
        message: 'No hay tareas pendientes', 
        task: null 
      });
    }

    // Devolvemos la orden limpia que el Arduino necesita leer fácilmente
    res.status(200).json({
      success: true,
      task: {
        id: task._id,
        action: task.action,
        slotMotor: task.slotMotor,
        paciente: task.pacienteId ? task.pacienteId.nombre : 'Desconocido',
        pastilla: task.pastillaId ? task.pastillaId.nombre : 'Desconocida'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar tareas', details: error.message });
  }
});

// 2. ENDPOINT PARA EL DASHBOARD / SISTEMA: Crear una tarea de dispensación manual o programada
router.post('/', async (req, res) => {
  try {
    const { pacienteId, pastillaId, slotMotor, scheduledTime } = req.body;

    const newTask = new Task({
      pacienteId,
      pastillaId,
      slotMotor,
      scheduledTime: scheduledTime || new Date()
    });

    await newTask.save();
    res.status(201).json({ message: 'Tarea de dispensación programada con éxito', task: newTask });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la tarea', details: error.message });
  }
});

// 3. ENDPOINT PARA VER HISTORIAL: Ver qué se ha dispensado o está pendiente
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 }).limit(50).populate('pacienteId pastillaId');
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el historial de tareas', details: error.message });
  }
});

module.exports = router;
