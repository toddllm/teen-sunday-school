const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Define system permissions
const PERMISSIONS = [
  // User Management
  { name: 'users:read', displayName: 'View Users', description: 'View user list and profiles', category: 'users' },
  { name: 'users:create', displayName: 'Create Users', description: 'Create new user accounts', category: 'users' },
  { name: 'users:update', displayName: 'Update Users', description: 'Edit user profiles', category: 'users' },
  { name: 'users:delete', displayName: 'Delete Users', description: 'Delete user accounts', category: 'users' },

  // Role Management
  { name: 'roles:read', displayName: 'View Roles', description: 'View roles and permissions', category: 'roles' },
  { name: 'roles:assign', displayName: 'Assign Roles', description: 'Assign roles to users', category: 'roles' },
  { name: 'roles:create', displayName: 'Create Roles', description: 'Create new roles', category: 'roles' },
  { name: 'roles:update', displayName: 'Update Roles', description: 'Modify existing roles', category: 'roles' },
  { name: 'roles:delete', displayName: 'Delete Roles', description: 'Delete roles', category: 'roles' },

  // Lesson Management
  { name: 'lessons:read', displayName: 'View Lessons', description: 'View all lessons', category: 'lessons' },
  { name: 'lessons:create', displayName: 'Create Lessons', description: 'Create new lesson plans', category: 'lessons' },
  { name: 'lessons:update', displayName: 'Update Lessons', description: 'Edit lesson plans', category: 'lessons' },
  { name: 'lessons:delete', displayName: 'Delete Lessons', description: 'Delete lesson plans', category: 'lessons' },
  { name: 'lessons:publish', displayName: 'Publish Lessons', description: 'Publish lessons for students', category: 'lessons' },

  // Content Moderation
  { name: 'comments:moderate', displayName: 'Moderate Comments', description: 'Review and moderate user comments', category: 'moderation' },
  { name: 'content:review', displayName: 'Review Content', description: 'Review user-generated content', category: 'moderation' },

  // Analytics
  { name: 'analytics:view', displayName: 'View Analytics', description: 'Access analytics and reports', category: 'analytics' },
  { name: 'analytics:export', displayName: 'Export Analytics', description: 'Export analytics data', category: 'analytics' },

  // Group Management
  { name: 'groups:read', displayName: 'View Groups', description: 'View group information', category: 'groups' },
  { name: 'groups:create', displayName: 'Create Groups', description: 'Create new groups', category: 'groups' },
  { name: 'groups:update', displayName: 'Update Groups', description: 'Modify group settings', category: 'groups' },
  { name: 'groups:delete', displayName: 'Delete Groups', description: 'Delete groups', category: 'groups' },
  { name: 'groups:manage_members', displayName: 'Manage Group Members', description: 'Add/remove group members', category: 'groups' },

  // System Administration
  { name: 'system:configure', displayName: 'System Configuration', description: 'Configure system settings', category: 'system' },
  { name: 'audit:view', displayName: 'View Audit Logs', description: 'Access audit logs', category: 'system' },
];

// Define system roles with their permissions
const ROLES = [
  {
    name: 'super_admin',
    displayName: 'Super Administrator',
    description: 'Full system access with all permissions',
    isSystem: true,
    permissions: PERMISSIONS.map(p => p.name), // All permissions
  },
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Administrative access without role management',
    isSystem: true,
    permissions: [
      'users:read', 'users:create', 'users:update',
      'lessons:read', 'lessons:create', 'lessons:update', 'lessons:delete', 'lessons:publish',
      'comments:moderate', 'content:review',
      'analytics:view', 'analytics:export',
      'groups:read', 'groups:create', 'groups:update', 'groups:delete', 'groups:manage_members',
    ],
  },
  {
    name: 'editor',
    displayName: 'Content Editor',
    description: 'Can create and edit lessons and content',
    isSystem: true,
    permissions: [
      'lessons:read', 'lessons:create', 'lessons:update',
      'comments:moderate',
      'groups:read',
    ],
  },
  {
    name: 'group_leader',
    displayName: 'Group Leader',
    description: 'Can manage their groups and view analytics',
    isSystem: true,
    permissions: [
      'lessons:read',
      'groups:read', 'groups:update', 'groups:manage_members',
      'analytics:view',
    ],
  },
  {
    name: 'teacher',
    displayName: 'Teacher',
    description: 'Can create lessons and manage their content',
    isSystem: true,
    permissions: [
      'lessons:read', 'lessons:create', 'lessons:update', 'lessons:publish',
      'groups:read',
      'analytics:view',
    ],
  },
  {
    name: 'user',
    displayName: 'User',
    description: 'Basic user access to view lessons and participate',
    isSystem: true,
    permissions: [
      'lessons:read',
    ],
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Create permissions
  console.log('📝 Creating permissions...');
  const permissionMap = {};
  for (const perm of PERMISSIONS) {
    const created = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
    permissionMap[perm.name] = created.id;
    console.log(`  ✓ ${perm.displayName}`);
  }

  // Create roles and assign permissions
  console.log('\n👥 Creating roles...');
  for (const role of ROLES) {
    const { permissions, ...roleData } = role;

    const createdRole = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: roleData,
    });

    console.log(`  ✓ ${role.displayName}`);

    // Assign permissions to role
    for (const permName of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: createdRole.id,
            permissionId: permissionMap[permName],
          },
        },
        update: {},
        create: {
          roleId: createdRole.id,
          permissionId: permissionMap[permName],
        },
      });
    }
  }

  // Create a default super admin user
  console.log('\n👤 Creating default super admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const superAdminRole = await prisma.role.findUnique({
    where: { name: 'super_admin' },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId_scope: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
        scope: 'global',
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
      scope: 'global',
    },
  });

  console.log('  ✓ Admin user created');
  console.log('    Email: admin@example.com');
  console.log('    Password: admin123');
  console.log('    ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!');

  console.log('\n✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
