import { Link, Outlet } from 'react-router-dom'

/**
 * Layout de las páginas existentes: la navegación que antes vivía en App.jsx
 * más la columna centrada (.app-shell en App.css).
 */
function AppShell() {
  return (
    <div className="app-shell">
      <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link> |  <Link to="/PatientDashboard">PatientDashboard</Link> | <Link to="/login">Login</Link>
      </nav>
      <Outlet />
    </div>
  )
}

export default AppShell
