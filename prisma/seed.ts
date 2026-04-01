import { PrismaClient } from '../src/generated/prisma';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@admin.com',
      password: adminPassword,
      role: 'ADMIN',
      budgetLimit: 10000000,
    },
  });

  // Create demo user
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@demo.com' },
    update: {},
    create: {
      name: 'Nguyễn Văn A',
      email: 'user@demo.com',
      password: userPassword,
      role: 'USER',
      budgetLimit: 5000000,
    },
  });

  // Sample incomes
  const incomeData = [
    { title: 'Lương tháng 3', amount: 15000000, category: 'Lương', description: 'Lương cố định', date: new Date('2026-03-01'), userId: user.id },
    { title: 'Thưởng dự án', amount: 5000000, category: 'Thưởng', description: 'Thưởng hoàn thành dự án X', date: new Date('2026-03-15'), userId: user.id },
    { title: 'Freelance design', amount: 3000000, category: 'Freelance', description: 'Thiết kế logo cho khách hàng', date: new Date('2026-03-20'), userId: user.id },
    { title: 'Lương tháng 2', amount: 15000000, category: 'Lương', description: 'Lương cố định', date: new Date('2026-02-01'), userId: user.id },
    { title: 'Đầu tư cổ phiếu', amount: 2000000, category: 'Đầu tư', description: 'Lợi nhuận cổ phiếu VNM', date: new Date('2026-02-10'), userId: user.id },
    { title: 'Lương tháng 1', amount: 15000000, category: 'Lương', description: 'Lương cố định', date: new Date('2026-01-01'), userId: user.id },
    { title: 'Lương tháng 4', amount: 15000000, category: 'Lương', description: 'Lương cố định', date: new Date('2026-04-01'), userId: user.id },
  ];

  for (const income of incomeData) {
    await prisma.income.create({ data: income });
  }

  // Sample outcomes
  const outcomeData = [
    { title: 'Tiền nhà', amount: 4000000, category: 'Hóa đơn', description: 'Tiền thuê nhà tháng 3', date: new Date('2026-03-01'), userId: user.id },
    { title: 'Ăn uống tuần 1', amount: 500000, category: 'Ăn uống', description: 'Chi phí ăn uống', date: new Date('2026-03-07'), userId: user.id },
    { title: 'Xăng xe', amount: 200000, category: 'Di chuyển', description: 'Đổ xăng', date: new Date('2026-03-05'), userId: user.id },
    { title: 'Mua sách', amount: 350000, category: 'Giáo dục', description: 'Sách lập trình', date: new Date('2026-03-10'), userId: user.id },
    { title: 'Khám bệnh', amount: 800000, category: 'Sức khỏe', description: 'Khám tổng quát', date: new Date('2026-03-12'), userId: user.id },
    { title: 'Xem phim', amount: 150000, category: 'Giải trí', description: 'Vé xem phim', date: new Date('2026-03-14'), userId: user.id },
    { title: 'Mua quần áo', amount: 1200000, category: 'Mua sắm', description: 'Mua đồ xuân', date: new Date('2026-03-18'), userId: user.id },
    { title: 'Tiền điện nước', amount: 600000, category: 'Hóa đơn', description: 'Hóa đơn điện nước tháng 3', date: new Date('2026-03-20'), userId: user.id },
    { title: 'Tiền nhà T2', amount: 4000000, category: 'Hóa đơn', description: 'Tiền thuê nhà tháng 2', date: new Date('2026-02-01'), userId: user.id },
    { title: 'Ăn uống T2', amount: 2000000, category: 'Ăn uống', description: 'Tổng ăn uống tháng 2', date: new Date('2026-02-28'), userId: user.id },
    { title: 'Tiền nhà T4', amount: 4000000, category: 'Hóa đơn', description: 'Tiền thuê nhà tháng 4', date: new Date('2026-04-01'), userId: user.id },
    { title: 'Ăn uống T4', amount: 800000, category: 'Ăn uống', description: 'Ăn uống đầu tháng 4', date: new Date('2026-04-01'), userId: user.id },
  ];

  for (const outcome of outcomeData) {
    await prisma.outcome.create({ data: outcome });
  }

  console.log('Seed completed!');
  console.log(`Admin: admin@admin.com / admin123`);
  console.log(`User: user@demo.com / user123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
