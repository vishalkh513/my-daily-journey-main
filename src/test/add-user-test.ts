import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../.env.local');
dotenv.config({ path: envPath });

import { DatabaseService } from '../integrations/mongodb/service';
import { closeDatabase } from '../integrations/mongodb/client';

async function testAddUser() {
  try {
    console.log('🔄 Adding a new user to MongoDB...\n');

    // Create a user
    const newUser = await DatabaseService.createUser({
      email: `user-${Date.now()}@example.com`,
      username: `testuser_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ User created successfully!');
    console.log('📝 User details:', JSON.stringify(newUser, null, 2));
    console.log('\n');

    // Retrieve the user to verify it exists
    console.log('🔄 Retrieving user from database...\n');
    const retrievedUser = await DatabaseService.getUser(newUser._id!);

    if (retrievedUser) {
      console.log('✅ User retrieved successfully from database!');
      console.log('📝 Retrieved user:', JSON.stringify(retrievedUser, null, 2));
      console.log('\n✅ SUCCESS: User was added to MongoDB and verified!\n');
    } else {
      console.log('❌ User not found in database');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await closeDatabase();
    process.exit(0);
  }
}

testAddUser();
