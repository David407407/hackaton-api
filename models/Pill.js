const mongoose = require('mongoose');

const pillSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  dosis: { type: String, required: true }, // Ej: "850 mg"
  slotCompartimento: { type: Number, required: true, min: 1, max: 6 }, // C1 al C6 del dispensador
  
  // Stock inicial y control
  stockActual: { type: Number, required: true }, 
  stockMinimoAlerta: { type: Number, default: 5 }, 
  
  fechaInicio: { type: Date, required: true },
  recurrencia: {
    tipo: { 
      type: String, 
      enum: ['diario', 'intervalo', 'dias_especificos'], 
      default: 'diario' 
    },
    intervaloHoras: { type: Number },
    horas: [{ type: String }] // Ej: ["14:30", "19:00"]
  }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Pill', pillSchema);
