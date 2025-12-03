import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const ownerNames = [
  'Sarah Mitchell', 'Mike Rodriguez', 'Emily Thompson', 'David Kennedy', 'Jessica Lambert', 'Robert Harrison',
  'Amanda Patterson', 'Chris Williams', 'Nicole Brown', 'Ryan Sullivan', 'Lauren Foster', 'James Davis',
  'Megan Clark', 'Tyler Johnson', 'Ashley Robinson', 'Kevin Murphy', 'Brittany Lewis', 'Brandon Taylor',
  'Stephanie Hughes', 'Justin Kelly', 'Rachel Garcia', 'Andrew Nelson', 'Samantha Valdez', 'Daniel Parker',
  'Jennifer Watson'
];

const locations = [
  'Los Angeles, CA', 'Orange County, CA', 'San Diego, CA', 'San Francisco, CA',
  'Las Vegas, NV', 'Phoenix, AZ', 'Denver, CO', 'Dallas, TX', 'Austin, TX',
  'Houston, TX', 'Chicago, IL', 'Nashville, TN', 'Atlanta, GA', 'Miami, FL',
  'Orlando, FL', 'New York, NY', 'Boston, MA', 'Seattle, WA', 'Portland, OR'
];

const bios = [
  'Disney enthusiast and frequent visitor!',
  'Love exploring the parks with family',
  'Passionate about magical experiences',
  'Making memories one visit at a time',
  'Disney magic is real and I believe in it',
];

const passTypes = ['Believe Key', 'Enchant Key', 'Inspire Key', 'Dream Key'];
const dateOptions = ['Nov 10-15', 'Nov 15-20', 'Nov 20-25', 'Dec 1-5', 'Dec 5-10', 'Dec 10-15', 'Weekdays only'];

async function seedDatabase() {
  const sqlite = new Database('local.db');
  
  try {
    console.log('Starting seed with raw SQL...');
    
    // Insert users with raw SQL
    console.log('Inserting users...');
    const insertUserStmt = sqlite.prepare(`
      INSERT INTO user (id, name, email, email_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const userIds: string[] = [];
    for (let i = 0; i < ownerNames.length; i++) {
      const userId = randomBytes(16).toString('hex');
      const email = `user${i + 1}@example.com`;
      const name = ownerNames[i];
      const now = Date.now();
      
      insertUserStmt.run(userId, name, email, 1, now, now);
      userIds.push(userId);
    }
    console.log(`✓ Inserted ${userIds.length} users`);
    
    // Insert accounts with raw SQL
    console.log('Inserting accounts...');
    const insertAccountStmt = sqlite.prepare(`
      INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (let i = 0; i < userIds.length; i++) {
      const accountId = randomBytes(16).toString('hex');
      const email = `user${i + 1}@example.com`;
      const hashedPassword = await bcrypt.hash('password123', 10);
      const now = Date.now();
      
      insertAccountStmt.run(accountId, email, 'email', userIds[i], hashedPassword, now, now);
    }
    console.log(`✓ Inserted ${userIds.length} accounts`);
    
    // Insert passes with raw SQL
    console.log('Inserting passes...');
    const insertPassStmt = sqlite.prepare(`
      INSERT INTO passes (title, pass_type, price, available_dates, user_id)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    for (let i = 0; i < 50; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const passType = passTypes[Math.floor(Math.random() * passTypes.length)];
      const dates = dateOptions[Math.floor(Math.random() * dateOptions.length)];
      let price = 50;
      if (passType === 'Dream Key') price = 110 + Math.floor(Math.random() * 30);
      else if (passType === 'Inspire Key') price = 80 + Math.floor(Math.random() * 20);
      else if (passType === 'Enchant Key') price = 60 + Math.floor(Math.random() * 20);
      else price = 40 + Math.floor(Math.random() * 20);
      
      insertPassStmt.run(`Magic Key - ${passType}`, passType, price, dates, userId);
    }
    console.log('✓ Inserted 50 passes');
    
    console.log('\n✅ Seeding complete!');
    return true;
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  } finally {
    sqlite.close();
    console.log('Database connection closed');
  }
}

console.log('Running seed...');
seedDatabase()
  .then(() => {
    console.log('SUCCESS');
    process.exit(0);
  })
  .catch(err => {
    console.error('FAILED:', err);
    process.exit(1);
  });
