import sequelize from './database.js';
import User from '../models/User.js';
import Make from '../models/Make.js';
import CarModel from '../models/CarModel.js';
import Variant from '../models/Variant.js';
import Color from '../models/Color.js';
import Car from '../models/Car.js';
import bcrypt from 'bcrypt';

// Seed data
const makesData = [
  { name: 'Audi', slug: 'audi', logoUrl: 'https://example.com/logos/audi.png' },
  { name: 'BMW', slug: 'bmw', logoUrl: 'https://example.com/logos/bmw.png' },
  { name: 'Mercedes-Benz', slug: 'mercedes-benz', logoUrl: 'https://example.com/logos/mercedes.png' },
  { name: 'Tesla', slug: 'tesla', logoUrl: 'https://example.com/logos/tesla.png' },
  { name: 'Porsche', slug: 'porsche', logoUrl: 'https://example.com/logos/porsche.png' },
  { name: 'Lexus', slug: 'lexus', logoUrl: 'https://example.com/logos/lexus.png' },
  { name: 'Jaguar', slug: 'jaguar', logoUrl: 'https://example.com/logos/jaguar.png' },
  { name: 'Land Rover', slug: 'land-rover', logoUrl: 'https://example.com/logos/landrover.png' },
  { name: 'Volvo', slug: 'volvo', logoUrl: 'https://example.com/logos/volvo.png' },
  { name: 'Alfa Romeo', slug: 'alfa-romeo', logoUrl: 'https://example.com/logos/alfaromeo.png' },
];

const modelsData = [
  // Audi
  { makeName: 'Audi', models: ['A3', 'A4', 'A6', 'Q5', 'Q7', 'R8'] },
  // BMW
  { makeName: 'BMW', models: ['3 Series', '5 Series', 'X3', 'X5', 'M4'] },
  // Mercedes-Benz
  { makeName: 'Mercedes-Benz', models: ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class'] },
  // Tesla
  { makeName: 'Tesla', models: ['Model 3', 'Model S', 'Model X', 'Model Y'] },
  // Porsche
  { makeName: 'Porsche', models: ['911', 'Cayenne', 'Panamera', 'Macan'] },
  // Lexus
  { makeName: 'Lexus', models: ['ES', 'RX', 'NX', 'LS'] },
  // Jaguar
  { makeName: 'Jaguar', models: ['F-Pace', 'XE', 'XF'] },
  // Land Rover
  { makeName: 'Land Rover', models: ['Range Rover', 'Discovery', 'Defender'] },
  // Volvo
  { makeName: 'Volvo', models: ['XC60', 'XC90', 'S60', 'V90'] },
  // Alfa Romeo
  { makeName: 'Alfa Romeo', models: ['Giulia', 'Stelvio', 'Tonale'] },
];

const variantsData = [
  { name: 'Base', alloySizes: [16, 17, 18] },
  { name: 'Sport', alloySizes: [18, 19, 20] },
  { name: 'Premium', alloySizes: [18, 19, 20] },
  { name: 'Luxury', alloySizes: [19, 20, 21] },
  { name: 'Performance', alloySizes: [19, 20, 21, 22] },
];

const colorsData = [
  { name: 'Black', colorCode: '#000000' },
  { name: 'White', colorCode: '#FFFFFF' },
  { name: 'Silver', colorCode: '#C0C0C0' },
  { name: 'Gray', colorCode: '#808080' },
  { name: 'Red', colorCode: '#FF0000' },
  { name: 'Blue', colorCode: '#0000FF' },
  { name: 'Green', colorCode: '#00FF00' },
  { name: 'Yellow', colorCode: '#FFFF00' },
  { name: 'Orange', colorCode: '#FFA500' },
  { name: 'Brown', colorCode: '#964B00' },
];

async function seed() {
  try {
    console.log('Starting database seeding...');
    
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Create default admin user
    const existingAdmin = await User.findOne({ where: { email: 'admin@wheelmatch.local' } });
    
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('Admin123', 10);
      
      await User.create({
        name: 'System Administrator',
        email: 'admin@wheelmatch.local',
        passwordHash: passwordHash,
        role: 'admin',
        isActive: true,
      });

      console.log('✓ Default admin user created');
      console.log('  Email: admin@wheelmatch.local');
      console.log('  Password: Admin123');
    } else {
      console.log('✓ Admin user already exists');
    }

    // Create Colors
    console.log('\nCreating colors...');
    const colors = [];
    for (const colorData of colorsData) {
      const [color] = await Color.findOrCreate({
        where: { name: colorData.name },
        defaults: colorData,
      });
      colors.push(color);
    }
    console.log(`✓ Created ${colors.length} colors`);

    // Create Makes
    console.log('\nCreating makes...');
    const makes = [];
    for (const makeData of makesData) {
      const [make] = await Make.findOrCreate({
        where: { name: makeData.name },
        defaults: makeData,
      });
      makes.push(make);
    }
    console.log(`✓ Created ${makes.length} makes`);

    // Create Models and Variants
    console.log('\nCreating models and variants...');
    let totalModels = 0;
    let totalVariants = 0;
    let totalCars = 0;

    for (const modelGroup of modelsData) {
      const make = makes.find(m => m.name === modelGroup.makeName);
      if (!make) continue;

      for (const modelName of modelGroup.models) {
        const slug = modelName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        const [carModel] = await CarModel.findOrCreate({
          where: { makeId: make.id, name: modelName },
          defaults: {
            makeId: make.id,
            name: modelName,
            slug,
            isActive: true,
          },
        });
        totalModels++;

        // Create 3-4 variants per model
        const numVariants = Math.floor(Math.random() * 2) + 3; // 3 or 4
        for (let i = 0; i < numVariants; i++) {
          const variantTemplate = variantsData[i % variantsData.length];
          const alloySize = variantTemplate.alloySizes[Math.floor(Math.random() * variantTemplate.alloySizes.length)];
          
          const [variant] = await Variant.findOrCreate({
            where: { modelId: carModel.id, name: variantTemplate.name },
            defaults: {
              modelId: carModel.id,
              name: variantTemplate.name,
              defaultAlloySize: alloySize,
              isActive: true,
            },
          });
          totalVariants++;

          // Create 2-3 cars per variant (different colors)
          const numCars = Math.floor(Math.random() * 2) + 2; // 2 or 3
          const usedColorIds = new Set();
          
          for (let j = 0; j < numCars; j++) {
            let randomColor;
            do {
              randomColor = colors[Math.floor(Math.random() * colors.length)];
            } while (usedColorIds.has(randomColor.id));
            
            usedColorIds.add(randomColor.id);
            
            const carImage = `https://example.com/cars/${make.slug}-${slug}-${variantTemplate.name.toLowerCase()}-${randomColor.name.toLowerCase()}.webp`;
            
            await Car.findOrCreate({
              where: { variantId: variant.id, colorId: randomColor.id },
              defaults: {
                variantId: variant.id,
                colorId: randomColor.id,
                carImage,
                isActive: true,
              },
            });
            totalCars++;
          }
        }
      }
    }

    console.log(`✓ Created ${totalModels} models`);
    console.log(`✓ Created ${totalVariants} variants`);
    console.log(`✓ Created ${totalCars} cars`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`  - Makes: ${makes.length}`);
    console.log(`  - Models: ${totalModels}`);
    console.log(`  - Variants: ${totalVariants}`);
    console.log(`  - Colors: ${colors.length}`);
    console.log(`  - Cars: ${totalCars}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
seed();
