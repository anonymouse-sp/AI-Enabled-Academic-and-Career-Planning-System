import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/college-finder';
const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5000; // 5 seconds

class Database {
  private static instance: Database;
  private retryCount: number = 0;
  private isConnected: boolean = false;

  private constructor() {
    this.setupMongoose();
  }

  private setupMongoose() {
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully');
      this.isConnected = true;
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      this.isConnected = false;
      this.retryConnection();
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      this.isConnected = false;
      this.retryConnection();
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await this.closeConnection();
      process.exit(0);
    });
  }

  private async retryConnection() {
    if (this.retryCount < MAX_RETRIES) {
      this.retryCount++;
      console.log(`Retrying connection... Attempt ${this.retryCount} of ${MAX_RETRIES}`);
      setTimeout(() => {
        this.connect().catch(console.error);
      }, RETRY_INTERVAL);
    } else {
      console.error('Failed to connect to MongoDB after maximum retries');
      process.exit(1);
    }
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      const options = {
        autoIndex: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      await mongoose.connect(MONGODB_URI, options);
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      this.retryConnection();
    }
  }

  public async closeConnection(): Promise<void> {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      process.exit(1);
    }
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getConnection(): mongoose.Connection {
    return mongoose.connection;
  }
}

export default Database;