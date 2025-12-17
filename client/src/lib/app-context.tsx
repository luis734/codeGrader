import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { api, type ApiUser, type ApiAssignment } from "./api";

interface AppContextType {
  user: ApiUser | null;
  users: ApiUser[];
  assignments: ApiAssignment[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshAssignments: () => Promise<void>;
  addUser: (name: string, email: string, password: string) => Promise<void>;
  addAssignment: (data: {
    title: string;
    description: string;
    dueDate: string;
    minTestsToPass: number;
    tests: Array<{ name: string; input: string; expected: string }>;
  }) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [assignments, setAssignments] = useState<ApiAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check if user is logged in on mount
  useEffect(() => {
    api.auth.me()
      .then(data => {
        setUser(data.user);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  // Load assignments when user logs in
  useEffect(() => {
    if (user) {
      refreshAssignments();
      if (user.role === "admin") {
        refreshUsers();
      }
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const data = await api.auth.login(email, password);
      setUser(data.user);
      toast({ title: `Welcome back, ${data.user.name}` });
      setLocation(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (error: any) {
      toast({ 
        title: "Login failed", 
        description: error.message, 
        variant: "destructive" 
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
      setUser(null);
      setUsers([]);
      setAssignments([]);
      setLocation("/auth");
    } catch (error: any) {
      toast({ 
        title: "Logout failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const refreshUsers = async () => {
    try {
      const data = await api.users.list();
      setUsers(data.users);
    } catch (error: any) {
      toast({ 
        title: "Failed to load users", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const refreshAssignments = async () => {
    try {
      const data = await api.assignments.list();
      setAssignments(data.assignments);
    } catch (error: any) {
      toast({ 
        title: "Failed to load assignments", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const addUser = async (name: string, email: string, password: string) => {
    try {
      await api.users.create(name, email, password);
      await refreshUsers();
      toast({ title: "User created", description: `${name} has been added.` });
    } catch (error: any) {
      toast({ 
        title: "Failed to create user", 
        description: error.message, 
        variant: "destructive" 
      });
      throw error;
    }
  };

  const addAssignment = async (data: {
    title: string;
    description: string;
    dueDate: string;
    minTestsToPass: number;
    tests: Array<{ name: string; input: string; expected: string }>;
  }) => {
    try {
      await api.assignments.create({
        ...data,
        language: "C",
        starterCode: "#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}",
      });
      await refreshAssignments();
      toast({ title: "Assignment created", description: `${data.title} has been published.` });
    } catch (error: any) {
      toast({ 
        title: "Failed to create assignment", 
        description: error.message, 
        variant: "destructive" 
      });
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{ 
      user, 
      users, 
      assignments,
      isLoading,
      login, 
      logout, 
      refreshUsers,
      refreshAssignments,
      addUser, 
      addAssignment,
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
