const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('Conectado exitosamente a MongoDB Atlas'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// ==========================================
// IMPORTAR RUTAS
// ==========================================
const userRoutes = require('./routes/userRoutes');
const pillRoutes = require('./routes/pillRoutes');
const patientRoutes = require('./routes/patientRoutes');

// Usar rutas en la API
app.use('/api/users', userRoutes);
app.use('/api/pills', pillRoutes);
app.use('/api/patients', patientRoutes);

const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);


// Puerto del servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
