const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Las horas de las asignaciones ("08:00") son hora local de la residencia
process.env.TZ = process.env.ZONA_HORARIA || 'America/Chihuahua';

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

const { ensureUpcomingTasks } = require('./services/taskScheduler');

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Conectado exitosamente a MongoDB Atlas');
    // Tareas del Arduino para hoy y mañana a partir de las asignaciones
    return ensureUpcomingTasks({ force: true });
  })
  .catch(err => console.error('Error al conectar a MongoDB:', err));

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const pillRoutes = require('./routes/pillRoutes');
const patientRoutes = require('./routes/patientRoutes');
const taskRoutes = require('./routes/taskRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pills', pillRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/assignments', assignmentRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
