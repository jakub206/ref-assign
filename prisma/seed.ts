import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

function requiredEnvironmentValue(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

const connectionString = requiredEnvironmentValue('DATABASE_URL');
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function seedAdmin() {
  const email = requiredEnvironmentValue('ADMIN_EMAIL').trim().toLowerCase();
  const password = requiredEnvironmentValue('ADMIN_PASSWORD');
  if (password.length < 12 || password.length > 72) {
    throw new Error('ADMIN_PASSWORD must contain between 12 and 72 characters');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { role: Role.ADMIN },
    create: { email, password: hashedPassword, role: Role.ADMIN },
  });
}

seedAdmin()
  .finally(async () => prisma.$disconnect())
  .catch((error: unknown) => {
    console.error('Failed to seed administrator:', error);
    process.exitCode = 1;
  });
