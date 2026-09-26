const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  edad: { type: Number, required: true },
  genero: { type: String, required: true },
  
  // Aquí guardamos los _id únicos de la colección 'Pills' para relacionarlos directamente
  pastillas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pill'
  }]
}, { 
  timestamps: true,
  versionKey: false 
});

module.exports = mongoose.model('Patient', patientSchema);
