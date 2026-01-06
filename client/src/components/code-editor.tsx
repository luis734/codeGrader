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
  const [scrollTop, setScrollTop] = React.useState(0);
  const [contentHeight, setContentHeight] = React.useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const editorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setLineCount(value.split("\n").length);
  }, [value]);

  // Calcular la altura del contenido después de que se renderice
  React.useEffect(() => {
    const updateHeight = () => {
      if (scrollContainerRef.current) {
        // Obtener el scrollHeight del contenedor (altura total del contenido)
        const height = scrollContainerRef.current.scrollHeight;
        setContentHeight(height);
      }
    };

    updateHeight();
    // Actualizar cuando cambia el valor o el número de líneas
    const timeoutId = setTimeout(updateHeight, 0);
    return () => clearTimeout(timeoutId);
  }, [value, lineCount]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Calcular la altura para la numeración basada en el contenido
  // Cada línea tiene 21px de altura (h-[21px]), más padding de 16px arriba y abajo (py-4)
  const lineHeight = 21;
  const padding = 16 * 2; // py-4 = 16px arriba + 16px abajo
  const calculatedHeight = lineCount * lineHeight + padding;
  // Usar la altura del contenido si está disponible, sino usar la calculada
  const lineNumbersHeight = contentHeight > 0 ? contentHeight : calculatedHeight;

  return (
    <div className={cn("relative font-mono text-sm border rounded-md overflow-hidden bg-[#2d2d2d]", className)}>
      <div 
        className="absolute left-0 top-0 w-12 bg-[#1e1e1e] border-r border-[#3e3e3e] text-[#858585] flex flex-col items-end py-4 pr-3 select-none pointer-events-none z-10 leading-[1.5]"
        style={{
          transform: `translateY(-${scrollTop}px)`,
          height: `${lineNumbersHeight}px`,
        }}
      >
        {Array.from({ length: Math.max(lineCount, 20) }).map((_, i) => (
          <div key={i} className="h-[21px] flex items-center">
            {i + 1}
          </div>
        ))}
      </div>
      <div 
        ref={scrollContainerRef}
        className="pl-12 h-full overflow-auto custom-scrollbar"
        onScroll={handleScroll}
      >
        <div ref={editorRef}>
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
    </div>
  );
}
