import { db } from "../db";
import { 
  users, 
  assignments, 
  tests, 
  submissions,
  type User, 
  type InsertUser,
  type Assignment,
  type InsertAssignment,
  type Test,
  type InsertTest,
  type Submission,
  type InsertSubmission
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  
  // Assignment operations
  getAllAssignments(): Promise<Assignment[]>;
  getAssignment(id: string): Promise<Assignment | undefined>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: string, data: Partial<InsertAssignment>): Promise<Assignment | undefined>;
  deleteAssignment(id: string): Promise<boolean>;
  
  // Test operations
  getTestsByAssignment(assignmentId: string): Promise<Test[]>;
  createTest(test: InsertTest): Promise<Test>;
  createTests(tests: InsertTest[]): Promise<Test[]>;
  deleteTestsByAssignment(assignmentId: string): Promise<void>;
  
  // Submission operations
  getSubmission(userId: string, assignmentId: string): Promise<Submission | undefined>;
  createOrUpdateSubmission(submission: InsertSubmission): Promise<Submission>;
  getUserSubmissions(userId: string): Promise<Submission[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async getAllAssignments(): Promise<Assignment[]> {
    return db.select().from(assignments);
  }

  async getAssignment(id: string): Promise<Assignment | undefined> {
    const result = await db.select().from(assignments).where(eq(assignments.id, id)).limit(1);
    return result[0];
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const result = await db.insert(assignments).values(assignment).returning();
    return result[0];
  }

  async updateAssignment(id: string, data: Partial<InsertAssignment>): Promise<Assignment | undefined> {
    const result = await db.update(assignments).set(data).where(eq(assignments.id, id)).returning();
    return result[0];
  }

  async deleteAssignment(id: string): Promise<boolean> {
    const result = await db.delete(assignments).where(eq(assignments.id, id)).returning();
    return result.length > 0;
  }

  async getTestsByAssignment(assignmentId: string): Promise<Test[]> {
    return db.select().from(tests).where(eq(tests.assignmentId, assignmentId));
  }

  async createTest(test: InsertTest): Promise<Test> {
    const result = await db.insert(tests).values(test).returning();
    return result[0];
  }

  async createTests(testList: InsertTest[]): Promise<Test[]> {
    if (testList.length === 0) return [];
    const result = await db.insert(tests).values(testList).returning();
    return result;
  }

  async deleteTestsByAssignment(assignmentId: string): Promise<void> {
    await db.delete(tests).where(eq(tests.assignmentId, assignmentId));
  }

  async getSubmission(userId: string, assignmentId: string): Promise<Submission | undefined> {
    const result = await db.select().from(submissions)
      .where(and(
        eq(submissions.userId, userId),
        eq(submissions.assignmentId, assignmentId)
      ))
      .limit(1);
    return result[0];
  }

  async createOrUpdateSubmission(submission: InsertSubmission): Promise<Submission> {
    const existing = await this.getSubmission(submission.userId, submission.assignmentId);
    
    if (existing) {
      const result = await db.update(submissions)
        .set({
          code: submission.code,
          status: submission.status,
          score: submission.score,
          passedTests: submission.passedTests,
          totalTests: submission.totalTests,
          submittedAt: new Date(),
        })
        .where(eq(submissions.id, existing.id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(submissions).values(submission).returning();
      return result[0];
    }
  }

  async getUserSubmissions(userId: string): Promise<Submission[]> {
    return db.select().from(submissions).where(eq(submissions.userId, userId));
  }
}

export const storage = new DatabaseStorage();
