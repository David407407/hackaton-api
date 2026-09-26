const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET: Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios', details: error.message });
  }
});

// POST: Crear un nuevo usuario (Registro)
router.post('/', async (req, res) => {
  try {
    const { nombre, email, usuario, password, turno } = req.body;
    
    const newUser = new User({ 
      nombre, 
      email, 
      usuario, 
      password,
      turno: turno || 'Matutino' 
    });
    
    await newUser.save();
    res.status(201).json({ message: 'Usuario creado con éxito', user: newUser });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario', details: error.message });
  }
});

// DELETE: Eliminar usuario por ID
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario', details: error.message });
  }
});

module.exports = router;
