import sequelize from './database.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

async function seed() {
  try {
    console.log('Starting database seeding...');
    
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@wheelmatch.local' } });
    
    if (existingAdmin) {
      console.log('Admin user already exists. Skipping seed.');
      process.exit(0);
      return;
    }

    // Create default admin user
    const passwordHash = await bcrypt.hash('Admin123', 10);
    
    await User.create({
      name: 'System Administrator',
      email: 'admin@wheelmatch.local',
      passwordHash: passwordHash,
      role: 'admin',
      isActive: true,
    });

    console.log('✓ Default admin user created successfully');
    console.log('  Email: admin@wheelmatch.local');
    console.log('  Password: Admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
