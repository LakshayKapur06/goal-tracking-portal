import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database with realistic Atomberg data...')

  // Clear existing data
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
      { phase: 'Goal Setting', status: 'CLOSED' },
      { phase: 'Q1 Check-in', status: 'ACTIVE' },
      { phase: 'Q2 Check-in', status: 'UPCOMING' },
      { phase: 'Q3 Check-in', status: 'UPCOMING' },
      { phase: 'Q4 Final', status: 'UPCOMING' },
    ]
  })

  const password = await bcrypt.hash('password123', 10)

  // --- Seed Users ---
  await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@company.com',
      password,
      role: 'ADMIN',
    }
  })

  const manager1 = await prisma.user.create({
    data: {
      name: 'Arindam (Production Manager)',
      email: 'manager@company.com',
      password,
      role: 'MANAGER',
    }
  })

  const manager2 = await prisma.user.create({
    data: {
      name: 'Priya (R&D Lead)',
      email: 'priya.manager@company.com',
      password,
      role: 'MANAGER',
    }
  })

  const employee1 = await prisma.user.create({
    data: {
      name: 'Ravi (IoT Engineer)',
      email: 'employee@company.com',
      password,
      role: 'EMPLOYEE',
      managerId: manager1.id
    }
  })

  const employee2 = await prisma.user.create({
    data: {
      name: 'Neha (Quality Analyst)',
      email: 'neha@company.com',
      password,
      role: 'EMPLOYEE',
      managerId: manager1.id
    }
  })

  const employee3 = await prisma.user.create({
    data: {
      name: 'Vikram (Supply Chain)',
      email: 'vikram@company.com',
      password,
      role: 'EMPLOYEE',
      managerId: manager2.id
    }
  })

  // --- Seed Goals for Employee 1 (Ravi - IoT Engineer) ---
  const raviGoals = [
    {
      title: 'Integrate Matter Protocol in Smart Fans',
      description: 'Develop and test Matter protocol firmware for the new Aris fan series.',
      thrustArea: 'Learning & Development',
      uomType: 'TIMELINE',
      target: '2026-09-30',
      weightage: 40,
      status: 'LOCKED',
    },
    {
      title: 'Reduce BLE Connectivity Drop Rate',
      description: 'Optimize Bluetooth Low Energy connection stability in the mobile app.',
      thrustArea: 'Customer Focus',
      uomType: 'MAX', // Lower is better
      target: '2', // Target 2% drop rate
      weightage: 30,
      status: 'LOCKED',
    },
    {
      title: 'Resolve Critical Firmware Bugs',
      description: 'Ensure zero P0 bugs in the Q2 firmware OTA update release.',
      thrustArea: 'Internal Process',
      uomType: 'ZERO',
      target: '0',
      weightage: 30,
      status: 'LOCKED',
    }
  ];

  for (const g of raviGoals) {
    const goal = await prisma.goal.create({ data: { ...g, employeeId: employee1.id } })
    
    if (g.status === 'LOCKED') {
      // Add Q1 Check-in for Ravi
      await prisma.checkIn.create({
        data: {
          goalId: goal.id,
          quarter: 'Q1',
          actualAchievement: g.uomType === 'TIMELINE' ? '2026-10-15' : (g.uomType === 'MAX' ? '2.5' : '0'),
          progressStatus: g.uomType === 'ZERO' ? 'COMPLETED' : 'ON_TRACK',
          managerComment: 'Good progress, but keep an eye on the Matter certification timelines.',
        }
      })
    }
  }

  // --- Seed Goals for Employee 2 (Neha - Quality Analyst) ---
  const nehaGoals = [
    {
      title: 'Decrease BLDC Motor Defect Rate',
      description: 'Enhance assembly line QA checks to reduce out-of-box motor humming issues.',
      thrustArea: 'Customer Focus',
      uomType: 'MAX',
      target: '1', // 1% defect rate target
      weightage: 50,
      status: 'PENDING_APPROVAL',
    },
    {
      title: 'Conduct Automated Testing Workshops',
      description: 'Train 15 line-workers on the new automated acoustic testing chamber.',
      thrustArea: 'Learning & Development',
      uomType: 'MIN',
      target: '15',
      weightage: 50,
      status: 'PENDING_APPROVAL',
    }
  ];

  for (const g of nehaGoals) {
    await prisma.goal.create({ data: { ...g, employeeId: employee2.id } })
  }

  // --- Seed Goals for Employee 3 (Vikram - Supply Chain) ---
  const vikramGoals = [
    {
      title: 'Optimize Logistics Cost for PCB Imports',
      description: 'Negotiate bulk freight rates for electronic components.',
      thrustArea: 'Financial',
      uomType: 'MAX',
      target: '85000', // max target budget
      weightage: 60,
      status: 'LOCKED',
    },
    {
      title: 'Audit Tier-1 Suppliers',
      description: 'Complete compliance and quality audits for top 5 stator suppliers.',
      thrustArea: 'Internal Process',
      uomType: 'MIN',
      target: '5',
      weightage: 40,
      status: 'LOCKED',
    }
  ];

  for (const g of vikramGoals) {
    const goal = await prisma.goal.create({ data: { ...g, employeeId: employee3.id } })
    
    // Vikram Q1 check in
    await prisma.checkIn.create({
      data: {
        goalId: goal.id,
        quarter: 'Q1',
        actualAchievement: g.uomType === 'MAX' ? '92000' : '2',
        progressStatus: 'ON_TRACK',
        managerComment: 'Supplier audits are slightly behind schedule. Let us catch up in Q2.',
      }
    })
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
