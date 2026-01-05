import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/lib/app-context";
import { useState } from "react";
import { UserPlus, FileCode, Users, Plus, Pencil, Trash2, Eye, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/rich-text-editor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApiUser, ApiAssignment } from "@/lib/api";
import { formatPrettyDate, formatRelativeDate } from "@/lib/utils";

export default function AdminPage() {
  const { users, assignments, addUser, updateUser, deleteUser, addAssignment, updateAssignment, deleteAssignment } = useApp();

  // User Form State
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");

  // Assignment Form State
  const [newAssignTitle, setNewAssignTitle] = useState("");
  const [newAssignDueDate, setNewAssignDueDate] = useState("");
  const [newAssignDesc, setNewAssignDesc] = useState("");
  const [newAssignTests, setNewAssignTests] = useState("");
  const [newStarterCode, setNewStarterCode] = useState("#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}");

  // Edit User Dialog
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserPassword, setEditUserPassword] = useState("");
  const [editUserRole, setEditUserRole] = useState<"admin" | "student">("student");

  // Edit Assignment Dialog
  const [editingAssignment, setEditingAssignment] = useState<ApiAssignment | null>(null);
  const [editAssignTitle, setEditAssignTitle] = useState("");
  const [editAssignDesc, setEditAssignDesc] = useState("");
  const [editAssignDueDate, setEditAssignDueDate] = useState("");
  const [editAssignTests, setEditAssignTests] = useState("");
  const [editStarterCode, setEditStarterCode] = useState("");
  const [editMinTests, setEditMinTests] = useState(1);

  // View Assignment Dialog
  const [viewingAssignment, setViewingAssignment] = useState<ApiAssignment | null>(null);

  // Delete confirmations
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deletingAssignmentId, setDeletingAssignmentId] = useState<string | null>(null);

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

  const openEditUser = (user: ApiUser) => {
    setEditingUser(user);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserPassword("");
    setEditUserRole(user.role);
  };

  const handleEditUser = async () => {
    if (!editingUser) return;
    
    const data: any = {};
    if (editUserName !== editingUser.name) data.name = editUserName;
    if (editUserEmail !== editingUser.email) data.email = editUserEmail;
    if (editUserPassword) data.password = editUserPassword;
    if (editUserRole !== editingUser.role) data.role = editUserRole;

    if (Object.keys(data).length === 0) {
      setEditingUser(null);
      return;
    }

    try {
      await updateUser(editingUser.id, data);
      setEditingUser(null);
    } catch (error) {
      // Error handled in context
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUserId) return;
    try {
      await deleteUser(deletingUserId);
      setDeletingUserId(null);
    } catch (error) {
      // Error handled in context
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignTitle) return;

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
        dueDate: newAssignDueDate,
        minTestsToPass: parsedTests.length || 1,
        starterCode: newStarterCode,
        tests: parsedTests,
      });

      setNewAssignTitle("");
      setNewAssignDesc("");
      setNewAssignTests("");
      setNewAssignDueDate("");
      setNewStarterCode("#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}");
    } catch (error) {
      // Error handled in context
    }
  };

  const openEditAssignment = (assignment: ApiAssignment) => {
    setEditingAssignment(assignment);
    setEditAssignTitle(assignment.title);
    setEditAssignDesc(assignment.description);
    setEditAssignDueDate(assignment.dueDate);
    setEditMinTests(assignment.minTestsToPass);
    setEditStarterCode(assignment.starterCode);
    setEditAssignTests(assignment.tests?.map(t => `${t.input}|${t.expected}`).join("\n") || "");
  };

  const handleEditAssignment = async () => {
    if (!editingAssignment) return;

    const parsedTests = editAssignTests
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
      await updateAssignment(editingAssignment.id, {
        title: editAssignTitle,
        description: editAssignDesc,
        dueDate: editAssignDueDate,
        minTestsToPass: editMinTests,
        starterCode: editStarterCode,
        tests: parsedTests,
      });
      setEditingAssignment(null);
    } catch (error) {
      // Error handled in context
    }
  };

  const handleDeleteAssignment = async () => {
    if (!deletingAssignmentId) return;
    try {
      await deleteAssignment(deletingAssignmentId);
      setDeletingAssignmentId(null);
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
            <div className="grid gap-6 md:grid-cols-[1fr_320px]">
              <Card>
                <CardHeader>
                  <CardTitle>Registered Users</CardTitle>
                  <CardDescription>All students and administrators with access.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users.map((user) => {
                      const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                      return (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {initials}
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                              {user.role}
                            </Badge>
                            <Button variant="ghost" size="icon" onClick={() => openEditUser(user)} data-testid={`button-edit-user-${user.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeletingUserId(user.id)} className="text-destructive hover:text-destructive" data-testid={`button-delete-user-${user.id}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    {users.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No users found.</p>
                    )}
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
                      <Input id="name" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="e.g. Alice Smith" required data-testid="input-new-user-name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="alice@edu.com" required data-testid="input-new-user-email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} placeholder="Min. 6 characters" required minLength={6} data-testid="input-new-user-password" />
                    </div>
                    <Button type="submit" className="w-full gap-2" data-testid="button-create-user">
                      <UserPlus className="h-4 w-4" /> Create User
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_450px]">
              <Card>
                <CardHeader>
                  <CardTitle>Active Assignments</CardTitle>
                  <CardDescription>Problems currently visible to students.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assignments.map((assign) => (
                      <div key={assign.id} className="p-4 border rounded-lg space-y-2 hover:bg-muted/30 transition-colors">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold">{assign.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{assign.language}</Badge>
                            <Button variant="ghost" size="icon" onClick={() => setViewingAssignment(assign)} data-testid={`button-view-assignment-${assign.id}`}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEditAssignment(assign)} data-testid={`button-edit-assignment-${assign.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeletingAssignmentId(assign.id)} className="text-destructive hover:text-destructive" data-testid={`button-delete-assignment-${assign.id}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-2" dangerouslySetInnerHTML={{ __html: assign.description }} />
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
                      <Input value={newAssignTitle} onChange={e => setNewAssignTitle(e.target.value)} placeholder="Lab 4: Arrays" required data-testid="input-new-assignment-title" />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <RichTextEditor
                        content={newAssignDesc}
                        onChange={setNewAssignDesc}
                        placeholder="Problem details..."
                      />
                    </div>
                    <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input type="date" value={newAssignDueDate} onChange={e => setNewAssignDueDate(e.target.value)} required data-testid="input-new-assignment-due-date"></Input>
                    </div>
                    <div className="space-y-2">
                      <Label>Starter Code</Label>
                      <textarea 
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={newStarterCode}
                        onChange={e => setNewStarterCode(e.target.value)}
                        data-testid="input-new-assignment-starter-code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Test Cases (Input|Expected)</Label>
                      <textarea 
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        placeholder={"1|Odd\n2|Even\n10|Even"}
                        value={newAssignTests}
                        onChange={e => setNewAssignTests(e.target.value)}
                        required
                        data-testid="input-new-assignment-tests"
                      />
                      <p className="text-xs text-muted-foreground">One test case per line. Format: Input|Output</p>
                    </div>
                    <Button type="submit" className="w-full gap-2" data-testid="button-create-assignment">
                      <Plus className="h-4 w-4" /> Publish Assignment
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editUserName} onChange={e => setEditUserName(e.target.value)} data-testid="input-edit-user-name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={editUserEmail} onChange={e => setEditUserEmail(e.target.value)} data-testid="input-edit-user-email" />
            </div>
            <div className="space-y-2">
              <Label>New Password (leave empty to keep current)</Label>
              <Input type="password" value={editUserPassword} onChange={e => setEditUserPassword(e.target.value)} placeholder="Enter new password" data-testid="input-edit-user-password" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editUserRole} onValueChange={(v) => setEditUserRole(v as "admin" | "student")}>
                <SelectTrigger data-testid="select-edit-user-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button onClick={handleEditUser} data-testid="button-save-user">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Assignment Dialog */}
      <Dialog open={!!editingAssignment} onOpenChange={(open) => !open && setEditingAssignment(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
            <DialogDescription>Update assignment details and tests.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={editAssignTitle} onChange={e => setEditAssignTitle(e.target.value)} data-testid="input-edit-assignment-title" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <RichTextEditor
                content={editAssignDesc}
                onChange={setEditAssignDesc}
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={editAssignDueDate} onChange={e => setEditAssignDueDate(e.target.value)} required data-testid="input-new-assignment-due-date"></Input>
            </div>
            <div className="space-y-2">
              <Label>Starter Code</Label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={editStarterCode}
                onChange={e => setEditStarterCode(e.target.value)}
                data-testid="input-edit-assignment-starter-code"
              />
            </div>
            <div className="space-y-2">
              <Label>Minimum Tests to Pass</Label>
              <Input type="number" min={1} value={editMinTests} onChange={e => setEditMinTests(parseInt(e.target.value) || 1)} data-testid="input-edit-assignment-min-tests" />
            </div>
            <div className="space-y-2">
              <Label>Test Cases (Input|Expected)</Label>
              <textarea 
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder={"1|Odd\n2|Even"}
                value={editAssignTests}
                onChange={e => setEditAssignTests(e.target.value)}
                data-testid="input-edit-assignment-tests"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAssignment(null)}>Cancel</Button>
            <Button onClick={handleEditAssignment} data-testid="button-save-assignment">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Assignment Dialog */}
      <Dialog open={!!viewingAssignment} onOpenChange={(open) => !open && setViewingAssignment(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingAssignment?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Description</Label>
              <div className="mt-2 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: viewingAssignment?.description || "" }} />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Due Date</Label>
              <div className="mt-2 prose prose-sm max-w-none">Vence {formatRelativeDate(viewingAssignment?.dueDate || '')} ({formatPrettyDate(viewingAssignment?.dueDate || '')})</div>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Starter Code</Label>
              <pre className="mt-2 bg-muted p-3 rounded-md text-sm font-mono overflow-x-auto">{viewingAssignment?.starterCode}</pre>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Test Cases ({viewingAssignment?.tests?.length || 0})</Label>
              <div className="mt-2 space-y-2">
                {viewingAssignment?.tests?.map((test, i) => (
                  <div key={i} className="border rounded p-2 text-sm">
                    <span className="font-medium">{test.name}:</span> Input: <code className="bg-muted px-1 rounded">{test.input}</code> → Expected: <code className="bg-muted px-1 rounded">{test.expected}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={!!deletingUserId} onOpenChange={(open) => !open && setDeletingUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="button-confirm-delete-user">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Assignment Confirmation */}
      <AlertDialog open={!!deletingAssignmentId} onOpenChange={(open) => !open && setDeletingAssignmentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the assignment and all associated test cases and submissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAssignment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="button-confirm-delete-assignment">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
