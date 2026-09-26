const mongoose = require('mongoose');

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/; // "HH:mm"
const FECHA = /^\d{4}-\d{2}-\d{2}$/; // "YYYY-MM-DD", sin zona horaria

// Qué pastilla toma un paciente, cuántas y a qué horas
const assignmentSchema = new mongoose.Schema({
  pacienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  pastillaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pill', required: true },

  cantidad: { type: Number, required: true, min: 1, max: 4 }, // Pastillas por toma
  horas: {
    type: [{ type: String, match: HORA }],
    validate: { validator: (horas) => horas.length >= 1 && horas.length <= 6, message: 'Entre 1 y 6 horarios' }
  },

  frecuencia: { type: String, enum: ['diaria', 'dias_especificos'], default: 'diaria' },
  dias: [{ type: Number, min: 1, max: 7 }], // 1 = lunes … 7 = domingo; solo con 'dias_especificos'

  fechaInicio: { type: String, match: FECHA, required: true },
  fechaFin: { type: String, match: FECHA, default: null },

  indicaciones: { type: String, default: '', maxlength: 140 },
  activa: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false });

assignmentSchema.path('dias').validate(function (dias) {
  return this.frecuencia !== 'dias_especificos' || dias.length > 0;
}, 'Elige al menos un día');

// Deja Patient.pastillas igual a las pastillas que el paciente tiene activas
assignmentSchema.statics.syncPatientPills = async function (pacienteId) {
  const pastillas = await this.distinct('pastillaId', { pacienteId, activa: true });
  await mongoose.model('Patient').updateOne({ _id: pacienteId }, { pastillas });
};

module.exports = mongoose.model('Assignment', assignmentSchema);
