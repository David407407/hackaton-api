const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  edad: { type: Number, required: true },
  genero: { 
    type: String, 
    enum: ['Masculino', 'Femenino', 'Otro'], 
    required: true 
  },
  
  // Colores cerrados para evitar duplicados o variaciones por el sensor RGB
  colorTarjeta: { 
    type: String, 
    enum: ['Azul', 'Rojo', 'Verde', 'Amarillo', 'Morado', 'Naranja'], 
    required: true 
  }, 
  
  porcentajeAdherencia: { type: Number, default: 100 },
  
  pastillas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pill'
  }]
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Patient', patientSchema);
