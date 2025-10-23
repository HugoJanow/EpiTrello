import { PrismaClient, CardPriority, ActivityType } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Hash a password using SHA-256 (will be replaced with argon2 in API)
 * This is just for seeding purposes
 */
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (in reverse order of dependencies)
  await prisma.activityLog.deleteMany();
  await prisma.cardLabel.deleteMany();
  await prisma.cardMember.deleteMany();
  await prisma.card.deleteMany();
  await prisma.list.deleteMany();
  await prisma.board.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleaned existing data');

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@epitrello.com',
        passwordHash: hashPassword('password123'),
        displayName: 'Alice Cooper',
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@epitrello.com',
        passwordHash: hashPassword('password123'),
        displayName: 'Bob Dylan',
      },
    }),
    prisma.user.create({
      data: {
        email: 'charlie@epitrello.com',
        passwordHash: hashPassword('password123'),
        displayName: 'Charlie Parker',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create boards
  const board1 = await prisma.board.create({
    data: {
      title: 'Product Development',
      description: 'Main product board for tracking features and bugs',
      ownerId: users[0]!.id,
    },
  });

  const board2 = await prisma.board.create({
    data: {
      title: 'Marketing Campaign Q4',
      description: 'Q4 marketing initiatives and content calendar',
      ownerId: users[1]!.id,
    },
  });

  console.log('✅ Created 2 boards');

  // Create lists for board1
  const lists1 = await Promise.all([
    prisma.list.create({
      data: {
        title: 'Backlog',
        boardId: board1.id,
        order: 1.0,
      },
    }),
    prisma.list.create({
      data: {
        title: 'In Progress',
        boardId: board1.id,
        order: 2.0,
      },
    }),
    prisma.list.create({
      data: {
        title: 'Review',
        boardId: board1.id,
        order: 3.0,
      },
    }),
    prisma.list.create({
      data: {
        title: 'Done',
        boardId: board1.id,
        order: 4.0,
      },
    }),
  ]);

  // Create lists for board2
  const lists2 = await Promise.all([
    prisma.list.create({
      data: {
        title: 'Ideas',
        boardId: board2.id,
        order: 1.0,
      },
    }),
    prisma.list.create({
      data: {
        title: 'In Production',
        boardId: board2.id,
        order: 2.0,
      },
    }),
    prisma.list.create({
      data: {
        title: 'Published',
        boardId: board2.id,
        order: 3.0,
      },
    }),
  ]);

  console.log(`✅ Created ${lists1.length + lists2.length} lists`);

  // Create cards for board1
  const cards1 = await Promise.all([
    // Backlog
    prisma.card.create({
      data: {
        title: 'Implement user authentication',
        description: 'Add JWT-based authentication with refresh tokens',
        listId: lists1[0]!.id,
        order: 1.0,
        priority: CardPriority.HIGH,
        dueDate: new Date('2025-11-01'),
      },
    }),
    prisma.card.create({
      data: {
        title: 'Design new landing page',
        description: 'Create mockups for the new landing page design',
        listId: lists1[0]!.id,
        order: 2.0,
        priority: CardPriority.MEDIUM,
      },
    }),
    prisma.card.create({
      data: {
        title: 'Setup CI/CD pipeline',
        listId: lists1[0]!.id,
        order: 3.0,
        priority: CardPriority.LOW,
      },
    }),
    // In Progress
    prisma.card.create({
      data: {
        title: 'Implement drag and drop',
        description: 'Add @dnd-kit for card reordering',
        listId: lists1[1]!.id,
        order: 1.0,
        priority: CardPriority.HIGH,
        dueDate: new Date('2025-10-25'),
      },
    }),
    prisma.card.create({
      data: {
        title: 'Create API documentation',
        description: 'Document all REST endpoints with OpenAPI',
        listId: lists1[1]!.id,
        order: 2.0,
        priority: CardPriority.MEDIUM,
      },
    }),
    // Review
    prisma.card.create({
      data: {
        title: 'Add dark mode support',
        description: 'Implement theme switching with Tailwind',
        listId: lists1[2]!.id,
        order: 1.0,
        priority: CardPriority.LOW,
      },
    }),
    prisma.card.create({
      data: {
        title: 'Write E2E tests',
        description: 'Add Playwright tests for critical user flows',
        listId: lists1[2]!.id,
        order: 2.0,
        priority: CardPriority.MEDIUM,
      },
    }),
    // Done
    prisma.card.create({
      data: {
        title: 'Setup Prisma schema',
        description: 'Define database models and relations',
        listId: lists1[3]!.id,
        order: 1.0,
        priority: CardPriority.HIGH,
      },
    }),
    prisma.card.create({
      data: {
        title: 'Configure Vite + React',
        listId: lists1[3]!.id,
        order: 2.0,
        priority: CardPriority.MEDIUM,
      },
    }),
  ]);

  // Create cards for board2
  const cards2 = await Promise.all([
    // Ideas
    prisma.card.create({
      data: {
        title: 'Blog post: Best productivity tips',
        listId: lists2[0]!.id,
        order: 1.0,
        priority: CardPriority.MEDIUM,
      },
    }),
    prisma.card.create({
      data: {
        title: 'Social media campaign - Holiday season',
        description: 'Plan Instagram and Twitter posts for holidays',
        listId: lists2[0]!.id,
        order: 2.0,
        priority: CardPriority.HIGH,
        dueDate: new Date('2025-11-15'),
      },
    }),
    // In Production
    prisma.card.create({
      data: {
        title: 'Product launch video',
        description: 'Shoot and edit 2-minute product demo video',
        listId: lists2[1]!.id,
        order: 1.0,
        priority: CardPriority.HIGH,
        dueDate: new Date('2025-10-30'),
      },
    }),
    prisma.card.create({
      data: {
        title: 'Update website copy',
        listId: lists2[1]!.id,
        order: 2.0,
        priority: CardPriority.MEDIUM,
      },
    }),
    // Published
    prisma.card.create({
      data: {
        title: 'Q3 Newsletter',
        description: 'Quarterly update sent to all subscribers',
        listId: lists2[2]!.id,
        order: 1.0,
        priority: CardPriority.LOW,
      },
    }),
    prisma.card.create({
      data: {
        title: 'Case study: Company X',
        listId: lists2[2]!.id,
        order: 2.0,
        priority: CardPriority.MEDIUM,
      },
    }),
  ]);

  console.log(`✅ Created ${cards1.length + cards2.length} cards`);

  // Assign members to some cards
  await Promise.all([
    // Card 1: Alice & Bob
    prisma.cardMember.create({
      data: { cardId: cards1[0]!.id, userId: users[0]!.id },
    }),
    prisma.cardMember.create({
      data: { cardId: cards1[0]!.id, userId: users[1]!.id },
    }),
    // Card 2: Charlie
    prisma.cardMember.create({
      data: { cardId: cards1[1]!.id, userId: users[2]!.id },
    }),
    // Card 4: Bob & Charlie
    prisma.cardMember.create({
      data: { cardId: cards1[3]!.id, userId: users[1]!.id },
    }),
    prisma.cardMember.create({
      data: { cardId: cards1[3]!.id, userId: users[2]!.id },
    }),
    // Board2 cards
    prisma.cardMember.create({
      data: { cardId: cards2[1]!.id, userId: users[1]!.id },
    }),
    prisma.cardMember.create({
      data: { cardId: cards2[2]!.id, userId: users[0]!.id },
    }),
  ]);

  console.log('✅ Assigned members to cards');

  // Add labels to some cards
  await Promise.all([
    prisma.cardLabel.create({
      data: {
        cardId: cards1[0]!.id,
        name: 'Security',
        color: '#ef4444',
      },
    }),
    prisma.cardLabel.create({
      data: {
        cardId: cards1[0]!.id,
        name: 'Backend',
        color: '#3b82f6',
      },
    }),
    prisma.cardLabel.create({
      data: {
        cardId: cards1[1]!.id,
        name: 'Design',
        color: '#8b5cf6',
      },
    }),
    prisma.cardLabel.create({
      data: {
        cardId: cards1[3]!.id,
        name: 'Frontend',
        color: '#10b981',
      },
    }),
    prisma.cardLabel.create({
      data: {
        cardId: cards2[1]!.id,
        name: 'Social Media',
        color: '#f59e0b',
      },
    }),
    prisma.cardLabel.create({
      data: {
        cardId: cards2[2]!.id,
        name: 'Video',
        color: '#ec4899',
      },
    }),
  ]);

  console.log('✅ Added labels to cards');

  // Add some activity logs
  await Promise.all([
    prisma.activityLog.create({
      data: {
        boardId: board1.id,
        userId: users[0]!.id,
        action: ActivityType.BOARD_CREATED,
        metadata: { title: board1.title },
      },
    }),
    prisma.activityLog.create({
      data: {
        cardId: cards1[0]!.id,
        userId: users[0]!.id,
        action: ActivityType.CARD_CREATED,
        metadata: { title: cards1[0]!.title },
      },
    }),
    prisma.activityLog.create({
      data: {
        cardId: cards1[3]!.id,
        userId: users[1]!.id,
        action: ActivityType.CARD_MOVED,
        metadata: { from: 'Backlog', to: 'In Progress' },
      },
    }),
  ]);

  console.log('✅ Added activity logs');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Users: ${users.length}`);
  console.log(`   Boards: 2`);
  console.log(`   Lists: ${lists1.length + lists2.length}`);
  console.log(`   Cards: ${cards1.length + cards2.length}`);
  console.log('\n👤 Test users:');
  console.log('   - alice@epitrello.com / password123');
  console.log('   - bob@epitrello.com / password123');
  console.log('   - charlie@epitrello.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
