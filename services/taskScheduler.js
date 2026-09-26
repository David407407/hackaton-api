const Assignment = require('../models/Assignment');
const Pill = require('../models/Pill');
const Task = require('../models/Task');

// Una toma que no se dispensó en este tiempo se marca 'missed' y el Arduino ya no la entrega
const TOLERANCIA_MS = 2 * 60 * 60 * 1000;
// Días hacia adelante (además de hoy) para los que se generan tareas
const DIAS_ADELANTE = 1;
// Cada cuánto, como máximo, se revisan todas las asignaciones (el Arduino consulta seguido)
const INTERVALO_REVISION_MS = 60 * 1000;
// Si el Arduino pidió una tarea y no la confirmó en este tiempo (timeout, reinicio), vuelve a pendiente
const RESERVA_MS = 2 * 60 * 1000;
// Veces que se le entrega una tarea sin confirmar antes de darla por perdida (evita repetirla sin fin)
const MAX_INTENTOS = 3;
// Servos del dispensador (C1…C4); sale del modelo para no repetir el número
const NUM_COMPARTIMENTOS = Pill.schema.path('slotCompartimento').options.max;

/** Date local → "YYYY-MM-DD" (la zona la fija process.env.TZ en index.js) */
function toISODate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function appliesOn(assignment, date) {
  const fecha = toISODate(date);
  if (fecha < assignment.fechaInicio) return false;
  if (assignment.fechaFin && fecha > assignment.fechaFin) return false;
  const diaSemana = date.getDay() || 7; // 1 = lunes … 7 = domingo
  return assignment.frecuencia !== 'dias_especificos' || assignment.dias.includes(diaSemana);
}

/** Horas exactas de las tomas de una asignación dentro de [desde, hasta] */
function doseTimes(assignment, desde, hasta) {
  const times = [];
  const day = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
  while (day <= hasta) {
    if (appliesOn(assignment, day)) {
      for (const hora of assignment.horas) {
        const [hh, mm] = hora.split(':').map(Number);
        const time = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hh, mm);
        if (time >= desde && time <= hasta) times.push(time);
      }
    }
    day.setDate(day.getDate() + 1);
  }
  return times;
}

/** Ventana de generación: desde lo que aún está en tolerancia hasta el final de mañana */
function generationWindow(now = new Date()) {
  const hasta = new Date(now.getFullYear(), now.getMonth(), now.getDate() + DIAS_ADELANTE, 23, 59, 59, 999);
  return { desde: new Date(now.getTime() - TOLERANCIA_MS), hasta };
}

/** Crea las tareas que falten; las que ya existen (en cualquier estado) no se tocan */
async function upsertTasks(assignment, pill, { desde, hasta }) {
  // Sin compartimento (o en uno que el dispensador no tiene) no puede entregarla: se da a mano
  const slot = pill?.slotCompartimento;
  if (!assignment.activa || slot == null || slot < 1 || slot > NUM_COMPARTIMENTOS) return;

  const ops = doseTimes(assignment, desde, hasta).map((scheduledTime) => ({
    updateOne: {
      filter: { asignacionId: assignment._id, scheduledTime },
      update: {
        $setOnInsert: {
          pacienteId: assignment.pacienteId,
          pastillaId: assignment.pastillaId,
          slotMotor: pill.slotCompartimento,
          cantidad: assignment.cantidad,
          status: 'pending'
        }
      },
      upsert: true
    }
  }));
  if (!ops.length) return;

  try {
    await Task.bulkWrite(ops, { ordered: false });
  } catch (error) {
    // Dos generaciones a la vez pueden chocar en el índice único: la tarea ya existe
    if (error.code !== 11000 && !error.writeErrors?.every((writeError) => writeError.code === 11000)) throw error;
  }
}

/** Reservas vencidas: vuelven a pendiente, o a 'missed' si ya agotaron sus intentos */
async function releaseStaleReservations(now = new Date()) {
  const stale = { status: 'dispensing', reservedAt: { $lt: new Date(now.getTime() - RESERVA_MS) } };
  await Task.updateMany({ ...stale, intentos: { $gte: MAX_INTENTOS } }, { status: 'missed' });
  await Task.updateMany(stale, { status: 'pending' });
}

async function markMissed(now = new Date()) {
  await Task.updateMany(
    { status: 'pending', scheduledTime: { $lt: new Date(now.getTime() - TOLERANCIA_MS) } },
    { status: 'missed' }
  );
}

/**
 * Rehace las tareas pendientes de una asignación (después de crearla, editarla,
 * pausarla o si cambió su pastilla). Las ya dispensadas o perdidas se conservan.
 */
async function syncAssignmentTasks(assignmentId) {
  await markMissed();
  await Task.deleteMany({ asignacionId: assignmentId, status: 'pending' });

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) return;
  const pill = await Pill.findById(assignment.pastillaId);
  await upsertTasks(assignment, pill, generationWindow());
}

/** Para cuando cambia el compartimento de una pastilla */
async function syncPillTasks(pillId) {
  const assignments = await Assignment.find({ pastillaId: pillId }).select('_id');
  for (const { _id } of assignments) await syncAssignmentTasks(_id);
}

let lastReview = 0;

/**
 * Marca las perdidas y asegura que existan las tareas de hoy y mañana de todas
 * las asignaciones activas. Sin `force`, la generación corre como máximo una
 * vez por minuto.
 */
async function ensureUpcomingTasks({ force = false } = {}) {
  await releaseStaleReservations();
  await markMissed();
  if (!force && Date.now() - lastReview < INTERVALO_REVISION_MS) return;
  lastReview = Date.now();

const assignments = await Assignment.find({ activa: true });
  const pills = await Pill.find({ _id: { $in: assignments.map((assignment) => assignment.pastillaId) } });
  const pillsById = new Map(pills.map((pill) => [String(pill._id), pill]));

  const window = generationWindow();
  for (const assignment of assignments) {
    await upsertTasks(assignment, pillsById.get(String(assignment.pastillaId)), window);
  }
}

module.exports = { TOLERANCIA_MS, RESERVA_MS, MAX_INTENTOS, NUM_COMPARTIMENTOS, doseTimes,ensureUpcomingTasks, syncAssignmentTasks, syncPillTasks };
