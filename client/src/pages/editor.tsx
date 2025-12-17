import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { CodeEditor } from "@/components/code-editor";
import { TestRunner, TestResult } from "@/components/test-runner";
import { Button } from "@/components/ui/button";
import { Upload, Download, Save, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";

// Mock template code
const INITIAL_CODE = `#include <stdio.h>

// Function to check if a number is prime
// Returns 1 if prime, 0 otherwise
int is_prime(int n) {
    if (n <= 1) return 0;
    // Your code here
    return 0;
}

int main() {
    int n;
    scanf("%d", &n);
    
    if (is_prime(n)) {
        printf("Prime\\n");
    } else {
        printf("Not Prime\\n");
    }
    
    return 0;
}
`;

const CORRECT_SNIPPET = `
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) return 0;
    }
    return 1;
`;

const INITIAL_TESTS: TestResult[] = [
  { id: 1, name: "Test Case 1: Small Prime", input: "7", expected: "Prime", status: "pending" },
  { id: 2, name: "Test Case 2: Small Non-Prime", input: "4", expected: "Not Prime", status: "pending" },
  { id: 3, name: "Test Case 3: Edge Case (1)", input: "1", expected: "Not Prime", status: "pending" },
  { id: 4, name: "Test Case 4: Negative Number", input: "-5", expected: "Not Prime", status: "pending" },
  { id: 5, name: "Test Case 5: Large Prime", input: "97", expected: "Prime", status: "pending" },
];

export default function EditorPage() {
  const [code, setCode] = useState(INITIAL_CODE);
  const [tests, setTests] = useState<TestResult[]>(INITIAL_TESTS);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

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

    // Determine if the code is "correct" (very simple check for the mock)
    // In a real app, this would send code to backend
    const isCorrect = code.includes("for") && code.includes("%") && code.includes("return 1");
    
    // Simulate sequential test execution
    for (let i = 0; i < tests.length; i++) {
      setTests(prev => {
        const newTests = [...prev];
        newTests[i] = { ...newTests[i], status: "running" };
        return newTests;
      });

      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate processing time

      setTests(prev => {
        const newTests = [...prev];
        // If code looks roughly correct, pass most tests. If it has the specific snippet, pass all.
        const shouldPass = isCorrect || (i < 2); // Always pass first 2 for demo if vaguely correct
        
        newTests[i] = {
          ...newTests[i],
          status: shouldPass ? "passed" : "failed",
          actual: shouldPass ? newTests[i].expected : "Error: Output mismatch"
        };
        return newTests;
      });
    }

    setIsRunning(false);
    
    const passedCount = isCorrect ? tests.length : 2;
    toast({
      title: isCorrect ? "All tests passed!" : "Some tests failed",
      description: `Score: ${passedCount}/${tests.length}`,
      variant: isCorrect ? "default" : "destructive",
    });
  };

  return (
    <Layout>
      <div className="h-full flex flex-col">
        {/* Toolbar */}
        <div className="h-14 border-b px-4 flex items-center justify-between bg-background">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold">Lab 2: Prime Number Calculator</h2>
            <Badge variant="outline" className="text-xs font-mono">main.c</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <input 
                type="file" 
                accept=".c" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleFileUpload}
              />
              <Button variant="outline" size="sm" className="gap-2">
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
            }}>
              <Download className="h-4 w-4" />
              Download
            </Button>
            
            <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700" onClick={runTests} disabled={isRunning}>
              <Play className="h-4 w-4 fill-current" />
              Run & Evaluate
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

import { Badge } from "@/components/ui/badge";
