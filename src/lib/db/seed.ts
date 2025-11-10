import { getDb, initializeDb } from './index';
import { passes } from './schema';

// Define sample data
const owners = [
  'Sarah M.', 'Mike R.', 'Emily T.', 'David K.', 'Jessica L.', 'Robert H.',
  'Amanda P.', 'Chris W.', 'Nicole B.', 'Ryan S.', 'Lauren F.', 'James D.',
  'Megan C.', 'Tyler J.', 'Ashley R.', 'Kevin M.', 'Brittany L.', 'Brandon T.',
  'Stephanie H.', 'Justin K.', 'Rachel G.', 'Andrew N.', 'Samantha V.', 'Daniel P.',
  'Jennifer W.'
];

const passTypes = ['Believe Key', 'Enchant Key', 'Inspire Key', 'Dream Key'];

const dateOptions = [
  'Nov 10-15', 'Nov 15-20', 'Nov 20-25', 'Dec 1-5', 'Dec 5-10',
  'Dec 10-15', 'Weekdays only', 'Weekends only', 'Any day!', 'Flexible - Contact me',
  'Nov 8-28', 'December available', 'January 2025', 'Spring 2025'
];

// Generate seed data
function generateSeedData() {
  const seedData = [];

  for (let i = 1; i <= 50; i++) {
    const owner = owners[Math.floor(Math.random() * owners.length)];
    const passType = passTypes[Math.floor(Math.random() * passTypes.length)];
    const dates = dateOptions[Math.floor(Math.random() * dateOptions.length)];
    
    let price;
    switch(passType) {
      case 'Believe Key': price = 40 + Math.floor(Math.random() * 20); break;
      case 'Enchant Key': price = 60 + Math.floor(Math.random() * 20); break;
      case 'Inspire Key': price = 80 + Math.floor(Math.random() * 20); break;
      case 'Dream Key': price = 110 + Math.floor(Math.random() * 30); break;
      default: price = 50;
    }

    seedData.push({
      title: `Magic Key - ${passType}`,
      owner: owner,
      price: price,
      passType: passType,
      availableDates: dates
    });
  }

  return seedData;
}

// Check if we're generating SQL or seeding directly
const generateSQL = process.argv.includes('--sql');
const seedData = generateSeedData();

// Generate SQL statements
if (generateSQL) {
  seedData.forEach(pass => {
    console.log(
      `INSERT INTO passes (title, owner, price, pass_type, available_dates) VALUES ('${pass.title}', '${pass.owner}', ${pass.price}, '${pass.passType}', '${pass.availableDates}');`
    );
  });
  process.exit(0);
}

// Export the seeding function
export async function seedDatabase() {
  try {
    console.log('Starting database seeding process...');
    console.log(`Environment mode: ${import.meta.env.MODE}`);
    // Initialize the database
    console.log('Initializing database...');
    await initializeDb();
    console.log('Database initialized successfully');

    console.log('Getting database client...');
    const db = await getDb();
    console.log('Database client obtained successfully');
    
    // generate seed data
    const seedData = generateSeedData();
    console.log(`Generated ${seedData.length} seed records`);

    // insert seed data 
    console.log('Inserting seed data...');
    const result = await db.insert(passes).values(seedData);
    console.log('Insert operation completed', result); 


    console.log('Database seeded successfully with 50 passes!');
    reutrn true
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Auto-run if this is the main script
if (import.meta.main) {
  console.log('Running seed script as main module');
  seedDatabase()
  .then(success => {
    console.log('Seed operation completed:', success ? 'SUCCESS' : 'FAILED');
    process.exit(success ? 0 : 1);
;  })
  .catch(err => {
    console.error('Seeding failed with an unhandled exception:', err);
    process.exit(1);
  });
}
