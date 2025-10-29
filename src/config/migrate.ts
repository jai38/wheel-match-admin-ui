import sequelize from './database.js';
import '../models/User.js';
import '../models/Make.js';
import '../models/CarModel.js';
import '../models/Color.js';
import '../models/Variant.js';
import '../models/Car.js';
import '../models/AlloyDesign.js';
import '../models/AlloyPCD.js';
import '../models/AlloyFinish.js';
import '../models/AlloySize.js';
import '../models/Alloy.js';

async function migrate() {
  try {
    console.log('Starting database migration...');
    
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
