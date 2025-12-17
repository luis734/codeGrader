import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { CodeEditor } from "@/components/code-editor";
import { TestRunner, TestResult } from "@/components/test-runner";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { useRoute } from "wouter";
import { useApp } from "@/lib/app-context";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

export default function EditorPage() {
  const [, params] = useRoute("/editor/:id");
  const assignmentId = params?.id;
  const { assignments, refreshAssignments } = useApp();
  
  // Find assignment
  const assignment = assignments.find(a => a.id === assignmentId) || assignments[0];

  const [code, setCode] = useState(assignment?.starterCode || "");
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (assignment) {
      setCode(assignment.starterCode);
      setTests(assignment.tests.map(t => ({
        id: parseInt(t.id) || 0,
        name: t.name,
        input: t.input,
        expected: t.expected,
        status: "pending" as const,
      })));
    }
  }, [assignment?.id]);

  if (!assignment) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading assignment...</p>
        </div>
      </Layout>
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.c')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .c file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCode(content);
      toast({
        title: "File uploaded",
        description: `Loaded ${file.name} successfully`,
      });
    };
    reader.readAsText(file);
  };

  const runTests = async () => {
    setIsRunning(true);
    
    // Reset tests
    setTests(prev => prev.map(t => ({ ...t, status: "pending", actual: undefined })));

    // Mock evaluation logic (in real app, would compile and run on server)
    const isCorrect = code.length > 100; // Simple check for demo
    
    // Simulate sequential test execution
    let passedCount = 0;
    
    for (let i = 0; i < tests.length; i++) {
      setTests(prev => {
        const newTests = [...prev];
        newTests[i] = { ...newTests[i], status: "running" };
        return newTests;
      });

      await new Promise(resolve => setTimeout(resolve, 600));

      setTests(prev => {
        const newTests = [...prev];
        const shouldPass = isCorrect || (i % 2 === 0);
        if (shouldPass) passedCount++;
        
        newTests[i] = {
          ...newTests[i],
          status: shouldPass ? "passed" : "failed",
          actual: shouldPass ? newTests[i].expected : "Error: Output mismatch"
        };
        return newTests;
      });
    }

    setIsRunning(false);
    
    const total = tests.length;
    const scoreText = `${passedCount}/${total}`;
    const isCompleted = passedCount >= assignment.minTestsToPass;
    
    // Submit to backend
    try {
      await api.submissions.submit(assignment.id, {
        code,
        passedTests: passedCount,
        totalTests: total,
        status: isCompleted ? "completed" : "in_progress",
        score: scoreText,
      });

      // Refresh assignments to update status
      await refreshAssignments();

      if (isCompleted) {
        toast({
          title: "Assignment Completed!",
          description: `You passed ${passedCount}/${total} tests. Great job!`,
        });
      } else {
        toast({
          title: "Tests Completed",
          description: `You passed ${passedCount}/${total} tests. You need ${assignment.minTestsToPass} to complete.`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="h-full flex flex-col">
        {/* Toolbar */}
        <div className="h-14 border-b px-4 flex items-center justify-between bg-background">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold">{assignment.title}</h2>
            <Badge variant="outline" className="text-xs font-mono">main.c</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <input 
                type="file" 
                accept=".c" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleFileUpload}
                data-testid="input-upload-file"
              />
              <Button variant="outline" size="sm" className="gap-2" data-testid="button-upload">
                <Upload className="h-4 w-4" />
                Upload File
              </Button>
            </div>
            
            <Button variant="outline" size="sm" className="gap-2" onClick={() => {
              const blob = new Blob([code], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "solution.c";
              a.click();
            }} data-testid="button-download">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        {/* Main Workspace */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={65} minSize={30}>
            <CodeEditor 
              value={code} 
              onChange={setCode} 
              className="h-full border-none rounded-none"
            />
          </ResizablePanel>
          
          <ResizableHandle />
          
          <ResizablePanel defaultSize={35} minSize={20}>
            <TestRunner 
              tests={tests} 
              onRunTests={runTests} 
              isRunning={isRunning} 
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </Layout>
  );
}
