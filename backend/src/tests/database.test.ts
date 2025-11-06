import Database from '../config/database';
import mongoose from 'mongoose';

describe('Database Connection', () => {
  let database: Database;

  beforeAll(() => {
    database = Database.getInstance();
  });

  afterAll(async () => {
    await database.closeConnection();
  });

  it('should connect to MongoDB successfully', async () => {
    await database.connect();
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
  });

  it('should be a singleton instance', () => {
    const instance1 = Database.getInstance();
    const instance2 = Database.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should handle connection errors gracefully', async () => {
    // Save original URI
    const originalUri = process.env.MONGODB_URI;
    // Set invalid URI
    process.env.MONGODB_URI = 'mongodb://invalid:27017/invalid';
    
    const consoleErrorSpy = jest.spyOn(console, 'error');
    await database.connect();
    
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // Restore original URI
    process.env.MONGODB_URI = originalUri;
    consoleErrorSpy.mockRestore();
  });
});