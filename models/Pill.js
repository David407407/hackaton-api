const mongoose = require('mongoose');

const pillSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  dosis: { type: String, required: true }, // Ej: "850 mg"
  forma: { type: String, enum: ['Tableta', 'Cápsula', 'Gragea'], default: 'Tableta' },
  slotCompartimento: { type: Number, default: null, min: 1, max: 6 }, // C1 al C6 del dispensador; null = sin cargar
  
  // Stock inicial y control
  stockActual: { type: Number, required: true }, 
  stockMinimoAlerta: { type: Number, default: 5 }, 
  capacidad: { type: Number, default: 30, min: 1, max: 60 }, // Pastillas que caben en el compartimento
  notas: { type: String, default: '', maxlength: 200 },
  
  fechaInicio: { type: Date, default: Date.now },
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
