/**
 * Shows the SENDER / RIDER / RECIPIENT / ADMIN / PUBLIC chip above each
 * page, as the design frames do. A development aid, off unless asked for.
 */
export function showRoleChip(): boolean {
  return import.meta.env.VITE_SHOW_ROLE_CHIP === 'true'
}
