const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  usuario: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  turno: { 
    type: String, 
    enum: ['Matutino', 'Vespertino', 'Nocturno'], 
    default: 'Matutino' 
  }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('User', userSchema);
