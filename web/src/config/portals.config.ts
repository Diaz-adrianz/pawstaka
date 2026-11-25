import { Logo, LogoAdminPortal } from '@/assets/images';

export const Portals = {
  administrator: {
    name: 'Administrator',
    description: 'Manage users, roles, and system settings',
    logo: LogoAdminPortal,
    basePath: '/admin',
    ability: { action: 'access', subject: 'portal:administrator' },
  },
  officer: {
    name: 'Officer',
    description: 'Manage library catalog, members, loans, and reports',
    logo: Logo,
    basePath: '/officer',
    ability: { action: 'access', subject: 'portal:officer' },
  },
} as const;
