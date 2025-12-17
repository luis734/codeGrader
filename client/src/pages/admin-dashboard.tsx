import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/lib/app-context";
import { useState } from "react";
import { UserPlus, FileCode, Users, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
  const { users, assignments, addUser, addAssignment } = useApp();

  // User Form State
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");

  // Assignment Form State
  const [newAssignTitle, setNewAssignTitle] = useState("");
  const [newAssignDesc, setNewAssignDesc] = useState("");
  const [newAssignTests, setNewAssignTests] = useState("");

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword) return;
    
    try {
      await addUser(newUserName, newUserEmail, newUserPassword);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
    } catch (error) {
      // Error handled in context
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignTitle) return;

    // Parse tests (Input|Expected format)
    const parsedTests = newAssignTests
      .split("\n")
      .filter(t => t.includes("|"))
      .map((t, i) => {
        const [input, expected] = t.split("|");
        return {
          name: `Test Case ${i + 1}`,
          input: input.trim(),
          expected: expected.trim(),
        };
      });

    try {
      await addAssignment({
        title: newAssignTitle,
        description: newAssignDesc,
        dueDate: "Due in 1 week",
        minTestsToPass: parsedTests.length,
        tests: parsedTests,
      });

      setNewAssignTitle("");
      setNewAssignDesc("");
      setNewAssignTests("");
    } catch (error) {
      // Error handled in context
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Master Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage users, assignments, and platform settings.
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4"/> Users</TabsTrigger>
            <TabsTrigger value="assignments" className="gap-2"><FileCode className="h-4 w-4"/> Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-[1fr_300px]">
              <Card>
                <CardHeader>
                  <CardTitle>Registered Users</CardTitle>
                  <CardDescription>All students and administrators with access.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => {
                      const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                      return (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {initials}
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                            {user.role}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>Add New User</CardTitle>
                  <CardDescription>Create a new student account.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="e.g. Alice Smith" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="alice@edu.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} placeholder="Min. 6 characters" required minLength={6} />
                    </div>
                    <Button type="submit" className="w-full gap-2">
                      <UserPlus className="h-4 w-4" /> Create User
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-[1fr_400px]">
              <Card>
                <CardHeader>
                  <CardTitle>Active Assignments</CardTitle>
                  <CardDescription>Problems currently visible to students.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assignments.map((assign) => (
                      <div key={assign.id} className="p-4 border rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold">{assign.title}</h3>
                          <Badge variant="outline">{assign.language}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{assign.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                          <span>Tests: {assign.tests?.length || 0}</span>
                          <span>Min to pass: {assign.minTestsToPass}</span>
                        </div>
                      </div>
                    ))}
                    {assignments.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No assignments created yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>Create Problem</CardTitle>
                  <CardDescription>Publish a new coding challenge.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddAssignment} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={newAssignTitle} onChange={e => setNewAssignTitle(e.target.value)} placeholder="Lab 4: Arrays" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input value={newAssignDesc} onChange={e => setNewAssignDesc(e.target.value)} placeholder="Problem details..." required />
                    </div>
                    <div className="space-y-2">
                      <Label>Test Cases (Input|Expected)</Label>
                      <textarea 
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        placeholder={"1|Odd\n2|Even\n10|Even"}
                        value={newAssignTests}
                        onChange={e => setNewAssignTests(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">One test case per line. Format: Input|Output</p>
                    </div>
                    <Button type="submit" className="w-full gap-2">
                      <Plus className="h-4 w-4" /> Publish Assignment
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
