const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  pacienteId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true 
  },
  pastillaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pill',
    required: true
  },
  // Asignación que generó la tarea (vacío en las creadas a mano)
  asignacionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  },
  cantidad: { type: Number, default: 1, min: 1 }, // Pastillas a entregar
action: { 
    type: String, 
    default: 'DISPENSE_PILL' // Instrucción clara para el Arduino
  },
  slotMotor: { 
    type: Number, 
    required: true // El número de compartimento o servo que debe girar (ej: 1, 2, 3...)
  },
  // pending → dispensing (el Arduino la pidió) → completed (el Arduino confirmó que giró el servo)
  // missed = pasó la tolerancia o se agotaron los intentos sin confirmarse
  status: {
    type: String,
    enum: ['pending', 'dispensing', 'completed', 'missed'],
    default: 'pending'
  },
  reservedAt: { type: Date, default: null }, // Cuándo la pidió el Arduino por última vez
  intentos: { type: Number, default: 0 }, // Veces que se entregó al Arduino
  scheduledTime: {
    type: Date,
    required: true // Hora exacta en la que debería tomarse/dispensarse
  },
  dispensedAt: { type: Date, default: null }
}, {
  timestamps: true,
  versionKey: false
});

// Una sola tarea por toma de cada asignación (la generación es idempotente)
taskSchema.index(
  { asignacionId: 1, scheduledTime: 1 },
  { unique: true, partialFilterExpression: { asignacionId: { $exists: true } } }
);

module.exports = mongoose.model('Task', taskSchema);
