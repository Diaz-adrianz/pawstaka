import { Condition } from '../../../../modules/access-control/interfaces/condition.interface';
import { RolesData } from './roles.data';

export const PermissionsData: {
  name: string;
  entries: {
    description: string;
    permission: string;
    roles: { name: string; condition?: Condition }[];
  }[];
}[] = [
  {
    name: 'auth',
    entries: [
      // session
      {
        description: 'Revoke session',
        permission: 'session:revoke',
        roles: [
          { name: RolesData.SUPERADMIN },
          {
            name: RolesData.OFFICER,
            condition: { userId: { eq: '{{actor.id}}' } },
          },
          {
            name: RolesData.MEMBER,
            condition: { userId: { eq: '{{actor.id}}' } },
          },
        ],
      },
      {
        description: 'Read session',
        permission: 'session:read',
        roles: [
          { name: RolesData.SUPERADMIN },
          {
            name: RolesData.OFFICER,
            condition: { userId: { eq: '{{actor.id}}' } },
          },
          {
            name: RolesData.MEMBER,
            condition: { userId: { eq: '{{actor.id}}' } },
          },
        ],
      },
      {
        description: 'Delete session',
        permission: 'session:delete',
        roles: [
          {
            name: RolesData.SUPERADMIN,
            condition: { userId: { eq: '{{actor.id}}' } },
          },
          {
            name: RolesData.OFFICER,
            condition: { userId: { eq: '{{actor.id}}' } },
          },
          {
            name: RolesData.MEMBER,
            condition: { userId: { eq: '{{actor.id}}' } },
          },
        ],
      },
    ],
  },
  {
    name: 'access-control',
    entries: [
      // permission
      {
        description: 'Read permission',
        permission: 'permission:read',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Update permission',
        permission: 'permission:update',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Archive permission',
        permission: 'permission:archive',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Restore permission',
        permission: 'permission:restore',
        roles: [{ name: RolesData.SUPERADMIN }],
      },

      // role
      {
        description: 'Create role',
        permission: 'role:create',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Read role',
        permission: 'role:read',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Update role',
        permission: 'role:update',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Archive role',
        permission: 'role:archive',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Restore role',
        permission: 'role:restore',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Delete role',
        permission: 'role:delete',
        roles: [{ name: RolesData.SUPERADMIN }],
      },

      // role user
      {
        description: 'Create role user',
        permission: 'role-user:create',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Read role user',
        permission: 'role-user:read',
        roles: [
          { name: RolesData.SUPERADMIN },
          {
            name: RolesData.OFFICER,
            condition: { userId: { eq: '{{actor.id}}' } },
          },
          {
            name: RolesData.MEMBER,
            condition: { userId: { eq: '{{actor.id}}' } },
          },
        ],
      },
      {
        description: 'Delete role',
        permission: 'role-user:delete',
        roles: [{ name: RolesData.SUPERADMIN }],
      },

      // role permission
      {
        description: 'Create role permission',
        permission: 'role-permission:create',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Read role permission',
        permission: 'role-permission:read',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Delete role permission',
        permission: 'role-permission:delete',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
    ],
  },
  {
    name: 'identity',
    entries: [
      // user
      {
        description: 'Invite user',
        permission: 'user:invite',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Create user',
        permission: 'user:create',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Read user',
        permission: 'user:read',
        roles: [
          { name: RolesData.SUPERADMIN },
          {
            name: RolesData.OFFICER,
            condition: { id: { eq: '{{actor.id}}' } },
          },
          {
            name: RolesData.MEMBER,
            condition: { id: { eq: '{{actor.id}}' } },
          },
        ],
      },
      {
        description: 'Update user',
        permission: 'user:update',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Update user avatar',
        permission: 'user:update-avatar',
        roles: [
          { name: RolesData.SUPERADMIN },
          {
            name: RolesData.OFFICER,
            condition: { id: { eq: '{{actor.id}}' } },
          },
          {
            name: RolesData.MEMBER,
            condition: { id: { eq: '{{actor.id}}' } },
          },
        ],
      },
      {
        description: 'Archive user',
        permission: 'user:archive',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Restore user',
        permission: 'user:restore',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Delete user',
        permission: 'user:delete',
        roles: [{ name: RolesData.SUPERADMIN }],
      },

      // profile
      {
        description: 'Read profile',
        permission: 'profile:read',
        roles: [
          { name: RolesData.SUPERADMIN },
          { name: RolesData.OFFICER },
          {
            name: RolesData.MEMBER,
            condition: { userId: { eq: '{{actor.id}}' } },
          },
        ],
      },
      {
        description: 'Update profile',
        permission: 'profile:update',
        roles: [
          { name: RolesData.SUPERADMIN },
          {
            name: RolesData.OFFICER,
            condition: { userId: { eq: '{{actor.id}}' } },
          },
          {
            name: RolesData.MEMBER,
            condition: { userId: { eq: '{{actor.id}}' } },
          },
        ],
      },
      {
        description: 'Archive profile',
        permission: 'profile:archive',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Restore profile',
        permission: 'profile:restore',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Delete profile',
        permission: 'profile:delete',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
    ],
  },
  {
    name: 'notification',
    entries: [
      // delivery
      {
        description: 'Create delivery',
        permission: 'delivery:create',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Read delivery',
        permission: 'delivery:read',
        roles: [{ name: RolesData.SUPERADMIN }],
      },

      // template
      {
        description: 'Create template',
        permission: 'template:create',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Read template',
        permission: 'template:read',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Update template',
        permission: 'template:update',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Archive template',
        permission: 'template:archive',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Restore template',
        permission: 'template:restore',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Delete template',
        permission: 'template:delete',
        roles: [{ name: RolesData.SUPERADMIN }],
      },

      // message
      {
        description: 'Mark message as read',
        permission: 'message:mark-read',
        roles: [
          {
            name: RolesData.SUPERADMIN,
            condition: { userId: { eq: '{{actor.id}}' } },
          },
          {
            name: RolesData.OFFICER,
            condition: { userId: { eq: '{{actor.id}}' } },
          },
          {
            name: RolesData.MEMBER,
            condition: { userId: { eq: '{{actor.id}}' } },
          },
        ],
      },
      {
        description: 'Read message',
        permission: 'message:read',
        roles: [
          { name: RolesData.SUPERADMIN },
          {
            name: RolesData.OFFICER,
            condition: { userId: { eq: '{{actor.id}}' } },
          },
          {
            name: RolesData.MEMBER,
            condition: { userId: { eq: '{{actor.id}}' } },
          },
        ],
      },
      {
        description: 'Delete message',
        permission: 'message:delete',
        roles: [
          {
            name: RolesData.SUPERADMIN,
            condition: { userId: { eq: '{{actor.id}}' } },
          },
          {
            name: RolesData.OFFICER,
            condition: { userId: { eq: '{{actor.id}}' } },
          },
          {
            name: RolesData.MEMBER,
            condition: { userId: { eq: '{{actor.id}}' } },
          },
        ],
      },

      // push token
      {
        description: 'Read push token',
        permission: 'push-token:read',
        roles: [
          { name: RolesData.SUPERADMIN },
          {
            name: RolesData.OFFICER,
            condition: { userId: { eq: '{{actor.id}}' } },
          },
          {
            name: RolesData.MEMBER,
            condition: { userId: { eq: '{{actor.id}}' } },
          },
        ],
      },
    ],
  },
  {
    name: 'portal',
    entries: [
      {
        description: 'Access administrator portal',
        permission: 'administrator:access',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
      {
        description: 'Access officer portal',
        permission: 'officer:access',
        roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }],
      },
    ],
  },
  {
    name: 'audit',
    entries: [
      {
        description: 'Read activity',
        permission: 'activity:read',
        roles: [{ name: RolesData.SUPERADMIN }],
      },
    ],
  },
  {
    name: 'library',
    entries: [
      // category
      {
        description: 'Create category',
        permission: 'category:create',
        roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }],
      },
      {
        description: 'Read category',
        permission: 'category:read',
        roles: [
          { name: RolesData.SUPERADMIN },
          { name: RolesData.OFFICER },
          { name: RolesData.MEMBER },
        ],
      },
      {
        description: 'Update category',
        permission: 'category:update',
        roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }],
      },
      {
        description: 'Archive category',
        permission: 'category:archive',
        roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }],
      },
      {
        description: 'Restore category',
        permission: 'category:restore',
        roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }],
      },
      {
        description: 'Delete category',
        permission: 'category:delete',
        roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }],
      },

      // book
      {
        description: 'Create book',
        permission: 'book:create',
        roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }],
      },
      {
        description: 'Read book',
        permission: 'book:read',
        roles: [
          { name: RolesData.SUPERADMIN },
          { name: RolesData.OFFICER },
          { name: RolesData.MEMBER },
        ],
      },
      {
        description: 'Update book',
        permission: 'book:update',
        roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }],
      },
      {
        description: 'Archive book',
        permission: 'book:archive',
        roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }],
      },
      {
        description: 'Restore book',
        permission: 'book:restore',
        roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }],
      },
      {
        description: 'Delete book',
        permission: 'book:delete',
        roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }],
      },

      // member
      {
        description: 'Create member',
        permission: 'member:create',
        roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }],
      },
      {
        description: 'Read member',
        permission: 'member:read',
        roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }],
      },
      {
        description: 'Update member',
        permission: 'member:update',
        roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }],
      },
      {
        description: 'Archive member',
        permission: 'member:archive',
        roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }],
      },
      {
        description: 'Restore member',
        permission: 'member:restore',
        roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }],
      },
      {
        description: 'Delete member',
        permission: 'member:delete',
        roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }],
      },

      // loan
      {
        description: 'Create loan',
        permission: 'loan:create',
        roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }],
      },
      {
        description: 'Read loan',
        permission: 'loan:read',
        roles: [
          { name: RolesData.SUPERADMIN },
          { name: RolesData.OFFICER },
          {
            name: RolesData.MEMBER,
            condition: { 'member.userId': { eq: '{{actor.id}}' } },
          },
        ],
      },
      {
        description: 'Return loan',
        permission: 'loan:return',
        roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }],
      },

      // report
      {
        description: 'Read report',
        permission: 'report:read',
        roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }],
      },
    ],
  },
];
