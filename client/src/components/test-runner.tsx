import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, Play, Loader2, AlertCircle, LockKeyhole, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface TestResult {
  id: string;
  name: string;
  status: "pending" | "running" | "passed" | "failed";
  secret: boolean;
  expected?: string;
  actual?: string;
  input?: string;
}

interface TestRunnerProps {
  tests: TestResult[];
  onRunTests: () => void;
  isRunning: boolean;
  score?: number;
}

export function TestRunner({ tests, onRunTests, isRunning, score }: TestRunnerProps) {
  const totalTests = tests.length;
  const passedTests = tests.filter(t => t.status === "passed").length;

  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());

  useEffect(() => {
    const failedTests = tests
      .filter(t => t.status === "failed" && !t.secret)
      .map(t => t.id);
  
    setExpandedTests(new Set(failedTests));
  }, [tests]);
  

  const toggleTest = (testId: string) => {
    setExpandedTests(prev => {
      const next = new Set(prev);
      if (next.has(testId)) {
        next.delete(testId);
      } else {
        next.add(testId);
      }
      return next;
    });
  };
  
  return (
    <div className="flex flex-col h-full bg-muted/30 border-l">
      <div className="p-4 border-b bg-background flex items-center justify-between sticky top-0 z-10">
        <div>
          <h3 className="font-semibold text-lg">Test Suite</h3>
          <p className="text-sm text-muted-foreground">
            {score !== undefined ? `${passedTests}/${totalTests} Passed` : "Ready to evaluate"}
          </p>
        </div>
        <Button 
          onClick={onRunTests} 
          disabled={isRunning}
          className={cn(
            "min-w-[120px]",
            isRunning ? "opacity-90" : ""
          )}
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4 fill-current" />
              Run Tests
            </>
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {tests.map((test) => {
          const isExpanded = expandedTests.has(test.id);
          return (<Card key={test.id} className="overflow-hidden border shadow-sm">
            <div
            onClick={() => {
              if (!test.secret && (test.status === "failed" || test.status === "passed" || test.status === "pending")) {
                toggleTest(test.id);
              }
            }} 
            className={cn(
              "p-3 flex items-center justify-between border-b",
              !test.secret && (test.status === "failed" || test.status === "passed") && "cursor-pointer hover:bg-muted/40",
              test.status === "pending" && "bg-muted/20",
              test.status === "running" && "bg-primary/5",
              test.status === "passed" && "bg-green-500/10",
              test.status === "failed" && "bg-destructive/10",
            )}>
              <div className="flex items-center gap-3">
                {test.status === "pending" && <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />}
                {test.status === "running" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                {test.status === "passed" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                {test.status === "failed" && <XCircle className="h-4 w-4 text-destructive" />}
                
                <span className={cn(
                  "font-medium text-sm",
                  test.status === "passed" && "text-green-700",
                  test.status === "failed" && "text-destructive"
                )}>
                  {test.name}
                </span>
              </div>
              
              <div className="flex gap-2 items-center">
                <Badge variant={
                  test.status === "passed" ? "default" : 
                  test.status === "failed" ? "destructive" : "outline"
                } className={cn(
                  test.status === "passed" && "bg-green-600 hover:bg-green-700",
                  "uppercase text-[10px]"
                )}>
                  {test.status}
                </Badge>
                {!test.secret && (test.status === "failed" || test.status === "passed" || test.status === "pending") && (
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                )}
                {test.secret && <LockKeyhole className="h-4 w-4 text-muted-foreground" />}
              </div>
            </div>

            {(test.status === "failed" || test.status === "passed" || test.status === "pending") && !test.secret && isExpanded && (
              <div className="p-3 text-xs font-mono bg-muted/30 space-y-2">
                <div>
                  <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Input:</span>
                  <div className="bg-background border rounded px-2 py-1 mt-1">{test.input}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Expected:</span>
                    <div className="bg-background border rounded px-2 py-1 mt-1 text-green-600/80">{test.expected}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Output:</span>
                    <div className={cn(
                      "bg-background border rounded px-2 py-1 mt-1",
                      test.status === "failed" ? "text-destructive" : "text-green-600"
                    )}>
                      {test.actual || 'null'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>)
        })}

        {tests.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No tests defined for this assignment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
