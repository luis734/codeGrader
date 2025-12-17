import React from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-c";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  value: string;
  onChange: (code: string) => void;
  className?: string;
  readOnly?: boolean;
}

export function CodeEditor({ value, onChange, className, readOnly }: CodeEditorProps) {
  const [lineCount, setLineCount] = React.useState(1);

  React.useEffect(() => {
    setLineCount(value.split("\n").length);
  }, [value]);

  return (
    <div className={cn("relative font-mono text-sm border rounded-md overflow-hidden bg-[#2d2d2d]", className)}>
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#1e1e1e] border-r border-[#3e3e3e] text-[#858585] flex flex-col items-end py-4 pr-3 select-none pointer-events-none z-10 leading-[1.5]">
        {Array.from({ length: Math.max(lineCount, 20) }).map((_, i) => (
          <div key={i} className="h-[21px] flex items-center">
            {i + 1}
          </div>
        ))}
      </div>
      <div className="pl-12 h-full overflow-auto custom-scrollbar">
        <Editor
          value={value}
          onValueChange={onChange}
          highlight={(code) => Prism.highlight(code, Prism.languages.c, "c")}
          padding={16}
          disabled={readOnly}
          className="min-h-full font-mono"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 14,
            lineHeight: "1.5",
            minHeight: "100%",
            backgroundColor: "#2d2d2d",
            color: "#ccc",
          }}
          textareaClassName="focus:outline-none"
        />
      </div>
    </div>
  );
}
