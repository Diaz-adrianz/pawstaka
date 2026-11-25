import { RolesData } from '../access-control/roles.data';

export const UsersData = [
  {
    username: 'superadmin',
    email: `superadmin@example.com`,
    roles: [{ name: RolesData.SUPERADMIN }],
  },
  {
    username: 'officer',
    email: `officer@example.com`,
    roles: [{ name: RolesData.OFFICER }],
  },
  {
    username: 'member',
    email: `member@example.com`,
    roles: [{ name: RolesData.MEMBER }],
  },
];
