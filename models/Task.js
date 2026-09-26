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
  action: { 
    type: String, 
    default: 'DISPENSE_PILL' // Instrucción clara para el Arduino
  },
  slotMotor: { 
    type: Number, 
    required: true // El número de compartimento o servo que debe girar (ej: 1, 2, 3...)
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed'], 
    default: 'pending' 
  },
  scheduledTime: { 
    type: Date, 
    required: true // Hora exacta en la que debería tomarse/dispensarse
  }
}, { 
  timestamps: true,
  versionKey: false 
});

module.exports = mongoose.model('Task', taskSchema);
