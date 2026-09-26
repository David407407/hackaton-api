import { Package, Pill, Users } from 'lucide-react';

/**
 * @typedef {object} NavItem
 * @property {string} id
 * @property {string} label
 * @property {import('react').ElementType} icon
 * @property {string} [to] Ruta; si falta, el item se muestra deshabilitado ("Próximamente").
 * @property {string} [badge]
 */

/** @type {NavItem[]} */
export const NAV_ITEMS = [
  { id: 'pacientes',  label: 'Pacientes',  icon: Users,   to: '/pacientes' },
  { id: 'inventario', label: 'Inventario', icon: Package, to: '/inventario' },
  { id: 'medicamentos', label: 'Medicamentos', icon: Pill, to: '/medicamentos' },
];
