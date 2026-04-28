import { getDatabase, closeDatabase } from '../integrations/mongodb/client';

async function showAllAccounts() {
  try {
    console.log('📊 Fetching all accounts from MongoDB...\n');

    const db = await getDatabase();
    const usersCollection = db.collection('users');
    
    const users = await usersCollection.find({}).toArray();

    if (users.length === 0) {
      console.log('❌ No accounts found in the database');
      return;
    }

    console.log(`✅ Found ${users.length} account(s):\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.username.toUpperCase()}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
      console.log(`   Updated: ${new Date(user.updatedAt).toLocaleString()}`);
      if (user.lastLogin) {
        console.log(`   Last Login: ${new Date(user.lastLogin).toLocaleString()}`);
      }
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Error fetching accounts:', error);
  } finally {
    await closeDatabase();
    process.exit(0);
  }
}

showAllAccounts();
