// models/Command.js
const mongoose = require('mongoose');

const commandSchema = new mongoose.Schema({
  action: { 
    type: String, 
    required: true // Ej: "LED_ON", "MOTOR_FORWARD", etc.
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed'], 
    default: 'pending' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Command', commandSchema);
