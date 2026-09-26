const mongoose = require('mongoose');

// Estado del dispensador. Vive en Mongo (no en memoria) para sobrevivir a los
// reinicios y deploys de Render.
const deviceSchema = new mongoose.Schema({
  _id: { type: String }, // 'dispensador'
  ultimaConexion: { type: Date, default: null }
}, { versionKey: false });

module.exports = mongoose.model('Device', deviceSchema);
