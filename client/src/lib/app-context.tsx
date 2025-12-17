import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "student";
  avatarInitials: string;
}

export interface TestResult {
  id: number;
  name: string;
  input: string;
  expected: string;
  status: "pending" | "running" | "passed" | "failed";
  actual?: string;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  status: "not_started" | "in_progress" | "completed";
  score: string;
  language: string;
  minTestsToPass: number;
  tests: TestResult[];
  starterCode: string;
}

interface AppContextType {
  user: User | null;
  users: User[];
  assignments: Assignment[];
  login: (email: string, role: "admin" | "student") => void;
  logout: () => void;
  addUser: (user: Omit<User, "id" | "avatarInitials">) => void;
  addAssignment: (assignment: Omit<Assignment, "id" | "status" | "score">) => void;
  updateAssignmentStatus: (id: number, status: Assignment["status"], score: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock Data
const MOCK_USERS: User[] = [
  { id: "1", name: "Master Admin", email: "admin@codecheck.com", role: "admin", avatarInitials: "AD" },
  { id: "2", name: "Juan Student", email: "juan@university.edu", role: "student", avatarInitials: "JS" },
];

const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 1,
    title: "Lab 1: Hello World & Basic I/O",
    description: "Write a program that prints 'Hello, World!' and reads user input.",
    dueDate: "Due Today",
    status: "completed",
    score: "5/5",
    language: "C",
    minTestsToPass: 5,
    tests: [],
    starterCode: "// Write your code here"
  },
  {
    id: 2,
    title: "Lab 2: Prime Number Calculator",
    description: "Implement a function to check if a number is prime and print primes up to N.",
    dueDate: "Due Tomorrow",
    status: "in_progress",
    score: "2/5",
    language: "C",
    minTestsToPass: 5,
    tests: [
      { id: 1, name: "Test Case 1: Small Prime", input: "7", expected: "Prime", status: "pending" },
      { id: 2, name: "Test Case 2: Small Non-Prime", input: "4", expected: "Not Prime", status: "pending" },
      { id: 3, name: "Test Case 3: Edge Case (1)", input: "1", expected: "Not Prime", status: "pending" },
      { id: 4, name: "Test Case 4: Negative Number", input: "-5", expected: "Not Prime", status: "pending" },
      { id: 5, name: "Test Case 5: Large Prime", input: "97", expected: "Prime", status: "pending" },
    ],
    starterCode: `#include <stdio.h>

int is_prime(int n) {
    if (n <= 1) return 0;
    // Your code here
    return 0;
}

int main() {
    int n;
    scanf("%d", &n);
    if (is_prime(n)) printf("Prime\\n");
    else printf("Not Prime\\n");
    return 0;
}`
  }
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const login = (email: string, role: "admin" | "student") => {
    // In a real app, we'd check credentials. Here we just find/create a mock user or use the admin one.
    const foundUser = users.find(u => u.email === email);
    
    if (foundUser) {
      setUser(foundUser);
      toast({ title: `Welcome back, ${foundUser.name}` });
      setLocation(foundUser.role === "admin" ? "/admin" : "/dashboard");
    } else {
      // Allow login for demo if not found (simulating "auto-register" or just demo flexibility)
      // ideally we only allow registered users as per requirement, but for dev speed we can be lenient or strict.
      // The requirement says "create users so they can access". Let's enforce existence.
      toast({ title: "Access Denied", description: "User not found. Please contact an administrator.", variant: "destructive" });
    }
  };

  const logout = () => {
    setUser(null);
    setLocation("/auth");
  };

  const addUser = (newUser: Omit<User, "id" | "avatarInitials">) => {
    const id = (users.length + 1).toString();
    const avatarInitials = newUser.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    setUsers([...users, { ...newUser, id, avatarInitials }]);
  };

  const addAssignment = (newAssignment: Omit<Assignment, "id" | "status" | "score">) => {
    const id = assignments.length + 1;
    setAssignments([...assignments, { ...newAssignment, id, status: "not_started", score: "-/-" }]);
  };

  const updateAssignmentStatus = (id: number, status: Assignment["status"], score: string) => {
    setAssignments(assignments.map(a => a.id === id ? { ...a, status, score } : a));
  };

  return (
    <AppContext.Provider value={{ 
      user, 
      users, 
      assignments, 
      login, 
      logout, 
      addUser, 
      addAssignment,
      updateAssignmentStatus 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
