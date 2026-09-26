const mongoose = require('mongoose');

const pillSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  dosis: { type: String, required: true }, 
  fechaInicio: { type: Date, required: true },
  
  recurrencia: {
    tipo: { 
      type: String, 
      enum: ['diario', 'intervalo', 'dias_especificos'], 
      default: 'diario' 
    },
    intervaloHoras: { type: Number }, 
    horas: [{ type: String }] // Ej: ["08:00", "20:00"]
  }
}, { 
  timestamps: true,
  versionKey: false 
});

module.exports = mongoose.model('Pill', pillSchema);
