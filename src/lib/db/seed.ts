import { getDb, initializeDb } from './index';
import { user, account, passes } from './schema';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

// Define sample data with full names
const ownerNames = [
  'Sarah Mitchell', 'Mike Rodriguez', 'Emily Thompson', 'David Kennedy', 'Jessica Lambert', 'Robert Harrison',
  'Amanda Patterson', 'Chris Williams', 'Nicole Brown', 'Ryan Sullivan', 'Lauren Foster', 'James Davis',
  'Megan Clark', 'Tyler Johnson', 'Ashley Robinson', 'Kevin Murphy', 'Brittany Lewis', 'Brandon Taylor',
  'Stephanie Hughes', 'Justin Kelly', 'Rachel Garcia', 'Andrew Nelson', 'Samantha Valdez', 'Daniel Parker',
  'Jennifer Watson'
];

const bios = [
  'Disney enthusiast and frequent visitor!',
  'Love exploring the parks with family',
  'Passionate about magical experiences',
  'Making memories one visit at a time',
  'Disney magic is real and I believe in it',
  'Annual pass holder who loves the adventure',
  'Creating unforgettable moments at Disney',
  'Believer in the magic of Disney parks',
  'Living the Disney dream!',
  'Where are you going? To the happiest place on earth!'
];

const locations = [
  'Los Angeles, CA', 'Orange County, CA', 'San Diego, CA', 'San Francisco, CA',
  'Las Vegas, NV', 'Phoenix, AZ', 'Denver, CO', 'Dallas, TX', 'Austin, TX',
  'Houston, TX', 'Chicago, IL', 'Nashville, TN', 'Atlanta, GA', 'Miami, FL',
  'Orlando, FL', 'New York, NY', 'Boston, MA', 'Seattle, WA', 'Portland, OR'
];

const passTypes = ['Believe Key', 'Enchant Key', 'Inspire Key', 'Dream Key'];

const dateOptions = [
  'Nov 10-15', 'Nov 15-20', 'Nov 20-25', 'Dec 1-5', 'Dec 5-10',
  'Dec 10-15', 'Weekdays only', 'Weekends only', 'Any day!', 'Flexible - Contact me',
  'Nov 8-28', 'December available', 'January 2025', 'Spring 2025'
];

// Generate seed data
function generateUserData() {
  const userData = [];
  
  for (let i = 0; i < ownerNames.length; i++) {
    const name = ownerNames[i];
    const email = `user${i + 1}@example.com`;
    const phone = `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
    const location = locations[Math.floor(Math.random() * locations.length)];
    const bio = bios[Math.floor(Math.random() * bios.length)];
    
    userData.push({
      id: randomBytes(16).toString('hex'),
      name,
      email,
      phone,
      location,
      bio,
      emailVerified: true,
      image: null,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
      updatedAt: new Date(),
    });
  }
  
  return userData;
}

function generatePassData(userIds: string[]) {
  const seedData = [];

  for (let i = 1; i <= 50; i++) {
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
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
      userId,
      price: price,
      passType: passType,
      availableDates: dates,
    });
  }

  return seedData;
}

// Check if we're generating SQL or seeding directly
const generateSQL = process.argv.includes('--sql');

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
    
    // Generate user data
    console.log('Generating user data...');
    const userData = generateUserData();
    console.log(`Generated ${userData.length} users`);

    // Insert users
    console.log('Inserting users...');
    await db.insert(user).values(userData).run();
    console.log('Users inserted successfully');

    // Insert accounts (passwords for test users)
    console.log('Inserting accounts...');
    const accountData = [];
    for (const u of userData) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      accountData.push({
        id: randomBytes(16).toString('hex'),
        accountId: u.email,
        providerId: 'email',
        userId: u.id,
        password: hashedPassword,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      });
    }
    await db.insert(account).values(accountData).run();
    console.log('Accounts inserted successfully');

    // Generate and insert pass data
    console.log('Generating pass data...');
    const userIds = userData.map(u => u.id);
    const passData = generatePassData(userIds);
    console.log(`Generated ${passData.length} passes`);

    console.log('Inserting passes...');
    await db.insert(passes).values(passData).run();
    console.log('Passes inserted successfully');

    console.log('\n✅ Database seeded successfully!');
    console.log(`   - ${userData.length} users created`);
    console.log(`   - ${accountData.length} accounts created (password: password123)`);
    console.log(`   - ${passData.length} passes created`);
    
    return true
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Only run seeding if this is the main script
if (!generateSQL) {
  console.log('Running seed script...');
  seedDatabase()
    .then(success => {
      console.log('Seed operation completed:', success ? 'SUCCESS' : 'FAILED');
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('Seeding failed with an unhandled exception:', err);
      process.exit(1);
    });
}
