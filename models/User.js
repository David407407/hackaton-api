const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Mongoose crea el _id automáticamente, pero si quieres usar un ID legible o incremental, 
  // el ObjectId por defecto de MongoDB ya es único globalmente.
  nombre: { type: String, required: true },
  usuario: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { 
  timestamps: true,
  versionKey: false // Opcional: quita el campo '__v' de control de versiones que pone Mongo
});

module.exports = mongoose.model('User', userSchema);
