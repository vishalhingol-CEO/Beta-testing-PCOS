/**
 * PCOS Platform Role Architecture
 * =================================
 * Type definitions for all platform roles across the user and admin hierarchy.
 *
 * Phase H (v0.5.0): Types defined only.
 * Enforcement begins in v0.6 (SA-01-IMPL) when authentication ships.
 * UI role-gating is reserved in Sidebar structure but not enforced in v0.5.0.
 *
 * Organisation roles (org_admin) are scoped to SA-03 — defined here for
 * completeness and type safety, but the `org_admin` role is never assigned
 * until organisations are implemented.
 *
 * @since v0.5.0 Phase H
 * @owner Lead Frontend Architect
 */

/** All platform roles in the PCOS permission hierarchy. */
export type UserRole =
  | 'platform_owner' // Full platform control — god mode. PCOS staff only.
  | 'system_admin'   // Platform management without billing controls.
  | 'org_admin'      // Organisation-level management (SA-03 — not yet active).
  | 'member'         // Standard authenticated user. The default role.
  | 'viewer';        // Read-only access to explicitly shared resources (SA-04).

/**
 * Numeric hierarchy for role comparison.
 * A higher number means more access.
 * Use `hasRole()` rather than comparing these numbers directly.
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  platform_owner: 100,
  system_admin:   80,
  org_admin:      60,
  member:         40,
  viewer:         20,
} as const;

/**
 * Returns true if `userRole` satisfies the `requiredRole` permission level.
 * A user satisfies a required role if their hierarchy score is >= the required score.
 *
 * @param userRole     - The role held by the current user.
 * @param requiredRole - The minimum role required for the action.
 *
 * @example
 *   hasRole('system_admin', 'member') // true — system_admin is above member
 *   hasRole('member', 'system_admin') // false — member is below system_admin
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * The default role assigned to all authenticated users in v0.5.0.
 * In v0.6+, this is set from the user's profile.
 */
export const DEFAULT_ROLE: UserRole = 'member' as const;

/**
 * Roles that have access to the admin diagnostics section.
 * Used by the Sidebar to conditionally render the admin zone (future).
 */
export const ADMIN_ROLES: ReadonlySet<UserRole> = new Set([
  'platform_owner',
  'system_admin',
] as const);

/**
 * Returns true if the given role has access to admin capabilities.
 */
export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.has(role);
}
