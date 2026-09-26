import './App.css'

import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import About from './pages/About'
import PatientDashboard from './pages/PatientDashboard'
import Login from './pages/Login'
import Patients from './pages/Patients'
import Inventory from './pages/Inventory'
import Medications from './pages/Medications'

function App() {
  return (
    <Routes>
      {/* Pantalla completa, sin sidebar */}
      <Route path="/" element={<Login />} />

      {/* Único layout de la app con sesión */}
      <Route element={<AppLayout />}>
        <Route path="/pacientes" element={<Patients />} />
        <Route path="/inventario" element={<Inventory />} />
        <Route path="/medicamentos" element={<Medications />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<PatientDashboard />} />
      </Route>
    </Routes>
  )
}

export default App