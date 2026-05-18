import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clean up
  await prisma.notificationLog.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.checkIn.deleteMany()
  await prisma.goal.deleteMany()
  await prisma.sharedGoal.deleteMany()
  await prisma.user.deleteMany()
  await prisma.cycleWindow.deleteMany()

  // --- Seed Cycle Windows ---
  await prisma.cycleWindow.createMany({
    data: [
      { phase: 'Goal Setting', status: 'ACTIVE' },
      { phase: 'Q1 Check-in', status: 'UPCOMING' },
      { phase: 'Q2 Check-in', status: 'UPCOMING' },
      { phase: 'Q3 Check-in', status: 'UPCOMING' },
      { phase: 'Q4 Final', status: 'UPCOMING' },
    ]
  })

  const password = await bcrypt.hash('password123', 10)

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@company.com',
      password,
      role: 'ADMIN',
    },
  })

  // 2. Create Manager
  const manager = await prisma.user.create({
    data: {
      name: 'Jane Manager',
      email: 'manager@company.com',
      password,
      role: 'MANAGER',
    },
  })

  // 3. Create Employee 1
  const employee1 = await prisma.user.create({
    data: {
      name: 'John Employee',
      email: 'employee@company.com',
      password,
      role: 'EMPLOYEE',
      managerId: manager.id,
    },
  })

  // 4. Create Employee 2
  const employee2 = await prisma.user.create({
    data: {
      name: 'Alice Colleague',
      email: 'alice@company.com',
      password,
      role: 'EMPLOYEE',
      managerId: manager.id,
    },
  })

  // --- Seed Goals for Employee 1 (Locked / Approved Goals) ---
  const g1 = await prisma.goal.create({
    data: {
      employeeId: employee1.id,
      title: 'Increase Q3 Sales Revenue',
      description: 'Achieve a 20% increase in regional sales.',
      thrustArea: 'Financial',
      uomType: 'MIN',
      target: '150000',
      weightage: 50,
      status: 'LOCKED',
    }
  })

  const g2 = await prisma.goal.create({
    data: {
      employeeId: employee1.id,
      title: 'Reduce Customer Wait Time',
      description: 'Average resolution time should decrease.',
      thrustArea: 'Customer',
      uomType: 'MAX',
      target: '24', // hours
      weightage: 30,
      status: 'LOCKED',
    }
  })

  const g3 = await prisma.goal.create({
    data: {
      employeeId: employee1.id,
      title: 'Zero Safety Incidents',
      description: 'Maintain a clean safety record.',
      thrustArea: 'Internal Process',
      uomType: 'ZERO',
      target: '0',
      weightage: 20,
      status: 'LOCKED',
    }
  })

  // --- Seed Check-ins for Employee 1 ---
  await prisma.checkIn.create({
    data: {
      goalId: g1.id,
      quarter: 'Q1',
      actualAchievement: '45000',
      progressStatus: 'ON_TRACK',
      managerComment: 'Good progress, keep it up!',
    }
  })
  
  await prisma.checkIn.create({
    data: {
      goalId: g2.id,
      quarter: 'Q1',
      actualAchievement: '30',
      progressStatus: 'ON_TRACK',
    }
  })

  // --- Seed Goals for Employee 2 (Pending Approval Goals) ---
  await prisma.goal.create({
    data: {
      employeeId: employee2.id,
      title: 'Complete AWS Certification',
      description: 'Get the Solutions Architect cert.',
      thrustArea: 'Learning & Growth',
      uomType: 'TIMELINE',
      target: '2026-10-15',
      weightage: 40,
      status: 'PENDING_APPROVAL',
    }
  })
  
  await prisma.goal.create({
    data: {
      employeeId: employee2.id,
      title: 'Deploy Automated Testing',
      thrustArea: 'Internal Process',
      uomType: 'TIMELINE',
      target: '2026-08-01',
      weightage: 60,
      status: 'PENDING_APPROVAL',
    }
  })

  console.log('Seed completed with dummy data!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
