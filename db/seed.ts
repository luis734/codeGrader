import { db } from "./index";
import { users } from "@shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");
  
  // Check if admin already exists
  const existingAdmin = await db.select().from(users).where(eq(users.email, "admin@codecheck.com")).limit(1);
  
  if (existingAdmin.length === 0) {
    // Create admin user
    const adminPasswordHash = await bcrypt.hash("admin123", 10);
    await db.insert(users).values({
      name: "Master Admin",
      email: "admin@codecheck.com",
      passwordHash: adminPasswordHash,
      role: "admin",
    });
    console.log("✓ Created admin user (admin@codecheck.com / admin123)");
  } else {
    console.log("✓ Admin user already exists");
  }

  // Check if student exists
  const existingStudent = await db.select().from(users).where(eq(users.email, "juan@university.edu")).limit(1);
  
  if (existingStudent.length === 0) {
    // Create demo student
    const studentPasswordHash = await bcrypt.hash("student123", 10);
    await db.insert(users).values({
      name: "Juan Student",
      email: "juan@university.edu",
      passwordHash: studentPasswordHash,
      role: "student",
    });
    console.log("✓ Created demo student (juan@university.edu / student123)");
  } else {
    console.log("✓ Demo student already exists");
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
