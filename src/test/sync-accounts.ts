import { DatabaseService } from '../integrations/mongodb/service';
import { closeDatabase, getDatabase } from '../integrations/mongodb/client';

async function syncAccountsToMongoDB() {
  try {
    console.log('🔄 Starting account sync to MongoDB...\n');

    // Accounts to sync (simulating what's in localStorage)
    const accounts = [
      {
        email: 'vishal@example.com',
        username: 'vishal',
        password: 'test123456',
        createdAt: new Date(),
      },
      {
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: 'SecurePass123',
        createdAt: new Date(),
      },
    ];

    for (const account of accounts) {
      try {
        console.log(`📝 Processing account: ${account.username} (${account.email})`);

        // Check if user already exists
        const existingUser = await DatabaseService.getUserByEmail(account.email);
        if (existingUser) {
          console.log(`⏭️  User already exists: ${account.email}\n`);
          continue;
        }

        // Create user
        const newUser = await DatabaseService.createUser({
          email: account.email,
          username: account.username,
          createdAt: account.createdAt,
          updatedAt: new Date(),
          lastLogin: new Date(),
        });

        console.log(`✅ User created: ${newUser._id}`);

        // Store password
        const db = await getDatabase();
        const credentialsCollection = db.collection('credentials');
        await credentialsCollection.insertOne({
          userId: newUser._id,
          passwordHash: account.password,
          createdAt: new Date(),
        });

        console.log(`✅ Password stored successfully\n`);
      } catch (error) {
        console.error(`❌ Error processing ${account.email}:`, error);
      }
    }

    console.log('✅ Account sync completed!');
  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    await closeDatabase();
    process.exit(0);
  }
}

syncAccountsToMongoDB();
