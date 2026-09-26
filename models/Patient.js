const mongoose = require('mongoose');

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

// Retrato ilustrado que se arma en el frontend (AvatarCustomizer / PatientAvatar)
const avatarSchema = new mongoose.Schema({
  peinado: { type: String, enum: ['chongo', 'corto', 'calvo'], required: true },
  lentes: { type: Boolean, default: false },
  barba: { type: Boolean, default: false },
  bigote: { type: Boolean, default: false },
  colorPiel: { type: String, match: HEX_COLOR, required: true },
  colorCabello: { type: String, match: HEX_COLOR, required: true },
  colorRopa: { type: String, match: HEX_COLOR, required: true },
  colorFondo: { type: String, match: HEX_COLOR, required: true }
}, { _id: false });

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
  
  avatar: avatarSchema,

  porcentajeAdherencia: { type: Number, default: 100 },
  
  pastillas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pill'
  }]
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Patient', patientSchema);
