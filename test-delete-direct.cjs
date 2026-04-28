const { MongoClient } = require('mongodb');

async function testDeleteDirectly() {
  try {
    // Connect to MongoDB
    const uri = 'mongodb+srv://vishal:vishal123@test.jogzeev.mongodb.net/mydatabase?appName=test';
    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('mydatabase');
    const marksCollection = db.collection('marks');
    
    // Find a mark to delete
    const marks = await marksCollection.find({ user_id: "69f11bdfac02f5ece948738e" }).toArray();
    console.log('Found marks:', marks.length);
    
    if (marks.length > 0) {
      const markToDelete = marks[0];
      console.log('Deleting mark:', markToDelete._id);
      
      // Delete the mark
      const result = await marksCollection.deleteOne({ _id: markToDelete._id });
      console.log('Delete result:', result);
      
      if (result.deletedCount > 0) {
        console.log('✅ SUCCESS: Mark deleted directly from MongoDB');
      } else {
        console.log('❌ FAILED: Mark not deleted');
      }
    } else {
      console.log('No marks found for this user');
    }
    
    await client.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testDeleteDirectly();
