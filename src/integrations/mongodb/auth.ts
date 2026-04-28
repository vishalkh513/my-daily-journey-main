import { DatabaseService } from './service';
import type { User } from './models';
import { ObjectId } from 'mongodb';

export interface AuthUser extends User {
  _id: ObjectId;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
}

export class AuthService {
  /**
   * Hash password using simple hash (for client-side, use Node.js bcrypt on server)
   * For production, implement server-side password hashing
   */
  private static async hashPassword(password: string): Promise<string> {
    // For client-side hashing, use a simple approach
    // In production, send to secure backend with server-side hashing
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  static async signup(email: string, username: string, password: string): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await DatabaseService.getUserByEmail(email);
      if (existingUser) {
        return {
          success: false,
          message: 'Email already registered',
        };
      }

      // Check if username is taken
      const { getDatabase } = await import('./client');
      const db = await getDatabase();
      const usersCollection = db.collection<User>('users');
      const userWithUsername = await usersCollection.findOne({ username });
      if (userWithUsername) {
        return {
          success: false,
          message: 'Username already taken',
        };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Create user
      const newUser = await DatabaseService.createUser({
        email,
        username,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
      });

      // Store hashed password separately (in production, use server-side hashing)
      // For now, we'll store it in a credentials collection
      const credentialsCollection = db.collection('credentials');
      await credentialsCollection.insertOne({
        userId: newUser._id,
        passwordHash: hashedPassword,
        createdAt: new Date(),
      });

      return {
        success: true,
        message: 'Account created successfully',
        user: newUser as AuthUser,
      };
    } catch (error) {
      return {
        success: false,
        message: `Sign up failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  static async signin(email: string, password: string): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await DatabaseService.getUserByEmail(email);
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Verify password
      const hashedPassword = await this.hashPassword(password);
      const { getDatabase } = await import('./client');
      const db = await getDatabase();
      const credentialsCollection = db.collection('credentials');
      const credentials = await credentialsCollection.findOne({
        userId: user._id,
      });

      if (!credentials || credentials.passwordHash !== hashedPassword) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Update last login
      await DatabaseService.updateUser(user._id, {
        lastLogin: new Date(),
      });

      return {
        success: true,
        message: 'Signed in successfully',
        user: user as AuthUser,
      };
    } catch (error) {
      return {
        success: false,
        message: `Sign in failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  static async logout(): Promise<void> {
    // Clear any client-side session data
    localStorage.removeItem('authUser');
  }

  static saveSession(user: AuthUser): void {
    localStorage.setItem('authUser', JSON.stringify(user));
  }

  static getSession(): AuthUser | null {
    const data = localStorage.getItem('authUser');
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
    return null;
  }

  static clearSession(): void {
    localStorage.removeItem('authUser');
  }
}

export default AuthService;
