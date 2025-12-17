import { Layout } from "@/components/layout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "wouter";

const ASSIGNMENTS = [
  {
    id: 1,
    title: "Lab 1: Hello World & Basic I/O",
    description: "Write a program that prints 'Hello, World!' and reads user input.",
    dueDate: "Due Today",
    status: "completed",
    score: "5/5",
    language: "C",
  },
  {
    id: 2,
    title: "Lab 2: Prime Number Calculator",
    description: "Implement a function to check if a number is prime and print primes up to N.",
    dueDate: "Due Tomorrow",
    status: "in_progress",
    score: "2/5",
    language: "C",
  },
  {
    id: 3,
    title: "Lab 3: Linked List Implementation",
    description: "Create a singly linked list with insert, delete, and print functions.",
    dueDate: "Due in 3 days",
    status: "not_started",
    score: "-/10",
    language: "C",
  },
  {
    id: 4,
    title: "Midterm Project: Student Database",
    description: "Manage student records using structs and file I/O.",
    dueDate: "Due in 1 week",
    status: "not_started",
    score: "-/20",
    language: "C",
  },
];

export default function DashboardPage() {
  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            View your active assignments and track your progress.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ASSIGNMENTS.map((assignment) => (
            <Card key={assignment.id} className="flex flex-col border-l-4 border-l-transparent hover:border-l-primary transition-all duration-200 shadow-sm hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {assignment.language}
                  </Badge>
                  {assignment.status === "completed" && (
                    <Badge className="bg-green-600 hover:bg-green-700">Completed</Badge>
                  )}
                  {assignment.status === "in_progress" && (
                    <Badge variant="secondary" className="text-blue-600 bg-blue-50">In Progress</Badge>
                  )}
                  {assignment.status === "not_started" && (
                    <Badge variant="outline" className="text-muted-foreground">Not Started</Badge>
                  )}
                </div>
                <CardTitle className="text-lg leading-tight">{assignment.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pb-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {assignment.description}
                </p>
                <div className="mt-4 flex items-center text-xs text-muted-foreground gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {assignment.dueDate}
                  </div>
                  {assignment.status !== "not_started" && (
                    <div className="flex items-center gap-1 font-medium">
                      {assignment.status === "completed" ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-blue-600" />
                      )}
                      Score: {assignment.score}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-3 border-t bg-muted/20">
                <Link href={`/editor/${assignment.id}`} className="w-full">
                  <Button className="w-full gap-2" variant={assignment.status === "completed" ? "outline" : "default"}>
                    {assignment.status === "not_started" ? "Start Assignment" : "Continue working"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
