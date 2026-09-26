const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// GET: Obtener pacientes con la información completa de sus pastillas (.populate)
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find().populate('pastillas');
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pacientes', details: error.message });
  }
});

// POST: Crear paciente y asignarle pastillas (pasando un arreglo de _id de pastillas)
router.post('/', async (req, res) => {
  try {
    const { nombre, edad, genero, pastillas } = req.body; // pastillas debe ser un array de ObjectIds
    
    const newPatient = new Patient({
      nombre,
      edad,
      genero,
      pastillas: pastillas || []
    });

    await newPatient.save();
    res.status(201).json({ message: 'Paciente registrado con éxito', patient: newPatient });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar paciente', details: error.message });
  }
});

// PUT: Actualizar paciente o agregarle/quitarle pastillas
router.put('/:id', async (req, res) => {
  try {
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('pastillas');
    
    res.status(200).json({ message: 'Paciente actualizado', patient: updatedPatient });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar paciente', details: error.message });
  }
});

// DELETE: Eliminar paciente por ID
router.delete('/:id', async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Paciente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar paciente', details: error.message });
  }
});

module.exports = router;
