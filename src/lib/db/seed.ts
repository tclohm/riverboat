import { db, passes } from './index';

const owners = [
  'Sarah M.', 'Mike R.', 'Emily T.', 'David K.', 'Jessica L.', 'Robert H.',
  'Amanda P.', 'Chris W.', 'Nicole B.', 'Ryan S.', 'Lauren F.', 'James D.',
  'Megan C.', 'Tyler J.', 'Ashley R.', 'Kevin M.', 'Brittany L.', 'Brandon T.',
  'Stephanie H.', 'Justin K.', 'Rachel G.', 'Andrew N.', 'Samantha V.', 'Daniel P.',
  'Jennifer W.'
];

const passTypes = ['Believe Key', 'Enchant Key', 'Inspire Key', 'Dream Key'];

const locations = [
  'Anaheim', 'Los Angeles', 'Orange County', 'San Diego', 'Irvine',
  'Long Beach', 'Santa Ana', 'Fullerton', 'Costa Mesa', 'Huntington Beach'
];

const dateOptions = [
  'Nov 10-15', 'Nov 15-20', 'Nov 20-25', 'Dec 1-5', 'Dec 5-10',
  'Dec 10-15', 'Weekdays only', 'Weekends only', 'Any day!', 'Flexible - Contact me',
  'Nov 8-28', 'December available', 'January 2025', 'Spring 2025'
];

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

// Check if we're generating SQL or seeding locally
const generateSQL = process.argv.includes('--sql');

if (generateSQL) {
  seedData.forEach(pass => {
    console.log(
      `INSERT INTO passes (title, owner, price, pass_type, available_dates) VALUES ('${pass.title}', '${pass.owner}', ${pass.price}, '${pass.passType}', '${pass.availableDates}');`
    );
  });
} else {
  db.insert(passes).values(seedData).run();
  console.log('Database seeded with 50 passes!');
}

