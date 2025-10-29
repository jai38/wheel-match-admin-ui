import sequelize from './src/config/database.js';
import User from './src/models/User.js';

async function activateUser() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    const result = await User.update(
      { isActive: true },
      { where: { email: 'test@example.com' } }
    );

    if (result[0] > 0) {
      console.log('✓ User account activated successfully');
    } else {
      console.log('✗ User not found with email: test@example.com');
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

activateUser();
