import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { createUserSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import bcrypt from "bcryptjs";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const createAssignmentSchema = z.object({
  title: z.string(),
  description: z.string(),
  dueDate: z.string(),
  language: z.string().default("C"),
  minTestsToPass: z.number(),
  starterCode: z.string(),
  tests: z.array(z.object({
    name: z.string(),
    input: z.string(),
    expected: z.string(),
  })),
});

const submitCodeSchema = z.object({
  code: z.string(),
  passedTests: z.number(),
  totalTests: z.number(),
  status: z.string(),
  score: z.string(),
});

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "codecheck-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );

  // Authentication middleware
  const requireAuth = async (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    req.user = user;
    next();
  };

  const requireAdmin = async (req: any, res: any, next: any) => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;
      const { passwordHash, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req: any, res) => {
    const { passwordHash, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  });

  // User routes
  app.get("/api/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const usersWithoutPasswords = allUsers.map(({ passwordHash, ...user }) => user);
      res.json({ users: usersWithoutPasswords });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const userData = createUserSchema.parse(req.body);
      const passwordHash = await bcrypt.hash(userData.password, 10);
      
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
      }

      const user = await storage.createUser({
        name: userData.name,
        email: userData.email,
        passwordHash,
        role: userData.role,
      });

      const { passwordHash: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Assignment routes
  app.get("/api/assignments", requireAuth, async (req: any, res) => {
    try {
      const allAssignments = await storage.getAllAssignments();
      
      // For students, attach their submission status
      if (req.user.role === "student") {
        const submissions = await storage.getUserSubmissions(req.user.id);
        const assignmentsWithStatus = await Promise.all(
          allAssignments.map(async (assignment) => {
            const submission = submissions.find(s => s.assignmentId === assignment.id);
            const tests = await storage.getTestsByAssignment(assignment.id);
            
            return {
              ...assignment,
              status: submission?.status || "not_started",
              score: submission?.score || `0/${tests.length}`,
              tests: tests.map(t => ({
                id: t.id,
                name: t.name,
                input: t.input,
                expected: t.expected,
                status: "pending",
              })),
            };
          })
        );
        return res.json({ assignments: assignmentsWithStatus });
      }
      
      // For admins, return all assignments with test counts
      const assignmentsWithTests = await Promise.all(
        allAssignments.map(async (assignment) => {
          const tests = await storage.getTestsByAssignment(assignment.id);
          return {
            ...assignment,
            tests: tests.map(t => ({
              id: t.id,
              name: t.name,
              input: t.input,
              expected: t.expected,
            })),
          };
        })
      );
      
      res.json({ assignments: assignmentsWithTests });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assignments" });
    }
  });

  app.get("/api/assignments/:id", requireAuth, async (req, res) => {
    try {
      const assignment = await storage.getAssignment(req.params.id);
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      const tests = await storage.getTestsByAssignment(assignment.id);
      res.json({ 
        assignment: {
          ...assignment,
          tests: tests.map(t => ({
            id: t.id,
            name: t.name,
            input: t.input,
            expected: t.expected,
          })),
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assignment" });
    }
  });

  app.post("/api/assignments", requireAuth, requireAdmin, async (req, res) => {
    try {
      const data = createAssignmentSchema.parse(req.body);
      const { tests: testData, ...assignmentData } = data;
      
      const assignment = await storage.createAssignment(assignmentData);
      
      const testsToCreate = testData.map((test) => ({
        assignmentId: assignment.id,
        name: test.name,
        input: test.input,
        expected: test.expected,
      }));
      
      const createdTests = await storage.createTests(testsToCreate);
      
      res.status(201).json({ 
        assignment: {
          ...assignment,
          tests: createdTests,
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      res.status(500).json({ error: "Failed to create assignment" });
    }
  });

  // Submission routes
  app.post("/api/assignments/:id/submit", requireAuth, async (req: any, res) => {
    try {
      const assignmentId = req.params.id;
      const data = submitCodeSchema.parse(req.body);
      
      const assignment = await storage.getAssignment(assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      const submission = await storage.createOrUpdateSubmission({
        userId: req.user.id,
        assignmentId,
        code: data.code,
        status: data.status,
        score: data.score,
        passedTests: data.passedTests,
        totalTests: data.totalTests,
      });

      res.json({ submission });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      res.status(500).json({ error: "Failed to submit code" });
    }
  });

  return httpServer;
}
