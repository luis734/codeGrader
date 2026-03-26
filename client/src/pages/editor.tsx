import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { CodeEditor } from "@/components/code-editor";
import { TestRunner, TestResult } from "@/components/test-runner";
import { InstructionBox } from "@/components/instruction-block";
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
  const { assignments, user, refreshAssignments } = useApp();
  
  // Find assignment
  const assignment = assignments.find(a => a.id === assignmentId) || assignments[0];

  // Usar código de submission previa si existe, sino usar starterCode
  const [code, setCode] = useState(
    assignment?.submission?.code || assignment?.starterCode || ""
  );
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (assignment) {
      // Cargar código de submission previa si existe, sino usar starterCode
      setCode(assignment.submission?.code || assignment.starterCode);
      setTests(assignment.tests.map(t => ({
        id: t.id,
        name: t.name,
        input: t.input,
        expected: t.expected,
        status: "pending" as const,
        secret: t.secret
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

    try {
      // 1️⃣ Llamamos al backend
      const data = await api.assignments.runTests(assignment.id, code);
      
      // 2️⃣ Error de compilacion
      if (data.compileError) {
        setTests(prev => 
          prev.map(t => ({
            ...t,
            status: "failed",
            actual: undefined,
          }))
        );

        const compileMsg =
          data.stderr?.trim()
            ? data.stderr
            : data.timeout
            ? "La compilación excedió el tiempo límite."
            : "Error de compilación (sin detalles).";

        toast({
          title: "Compilation error",
          description: compileMsg,
          variant: "destructive"
        });

        return;
      }

      // 3️⃣ Mostrar resultado uno por uno (animacion)
      let passedCount = 0;

      for (let i = 0; i < data.results.length; i++) {
        // Marcar como running
        setTests(prev => {
          const copy = [...prev];
          copy[i] = { ...copy[i], status: "running" };
          return copy;
        });

        await new Promise(r => setTimeout(r, 400));

        const result = data.results[i];

        if (result.passed) passedCount++;

        setTests(prev => {
          const copy = [...prev];
          copy[i] = {
            ...copy[i],
            status: result.passed ? "passed" : "failed",
            actual: result.passed ?
            result.actual :
            result.stderr || result.actual,
          };

          return copy;
        });
      }

      toast({
        title: "Tests completed",
        description: `Passed ${passedCount}/${data.totalTests}`,
      });
    } catch (error: any) {
      toast({
        title: "Error running tests",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmiting(true);
    const passedTests = tests.filter(t => t.status === "passed").length;
    const totalTests = tests.length;
    
    if (totalTests === 0 || tests.every(t => t.status === "pending")) {
      toast({
        title: "No tests run",
        description: "Please run tests before submitting",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await api.submissions.submit(assignment.id, {
        code,
        passedTests,
        totalTests,
        status: passedTests >= assignment.minTestsToPass ? "completed" : "in_progress",
        score: `${passedTests}/${totalTests}`
      });
      
      await refreshAssignments();
      
      toast({
        title: "Submission successful",
        description: `Submitted with score: ${passedTests}/${totalTests}`
      });
    } catch (error: any) {
      toast({
        title: "Error submitting",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmiting(false); 
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
          
          <ResizablePanel defaultSize={35} minSize={20} className="flex flex-col h-full">
            <div className="max-w-fullmax h-[30%] overflow-auto">
              <InstructionBox description={assignment.description}/>
            </div>

            <div className="flex-1 overflow-auto">
              <TestRunner
                tests={tests} 
                onRunTests={runTests} 
                isRunning={isRunning}
                onSubmiting={handleSubmit}
                isSubmiting={isSubmiting}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </Layout>
  );
}
