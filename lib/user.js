/**
 * Helpers para mostrar identidad del usuario de sesión de forma consistente
 * (header y sidebar). El objeto `user` viene de /auth/me y puede no traer
 * nombre; en ese caso se usa el email.
 */

const ROLE_LABELS = {
  super: 'Super Admin',
  admin: 'Administrador',
  institution_user: 'Usuario',
  user: 'Usuario',
};

/** Texto principal a mostrar: el email (identidad garantizada); nombre como respaldo. */
export function displayName(user) {
  return user?.email || user?.name || 'Usuario';
}

/** Etiqueta legible del rol. */
export function roleLabel(user) {
  return ROLE_LABELS[user?.role] || 'Usuario';
}

/** Iniciales para el avatar (de la parte local del email, o del nombre). */
export function initials(user) {
  if (user?.email) {
    return user.email.split('@')[0].slice(0, 2).toUpperCase();
  }
  if (user?.name) {
    return user.name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
  return 'U';
}
