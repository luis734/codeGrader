interface InstructionProps {
  description: string,
}

export function InstructionBox({description}: InstructionProps) {
  return (
    <div className="flex flex-col h-full bg-muted/30 border-l border-b text-justify flex-none">
      {/* Titulo del componete */}
      <div className="border-b bg-background py-2 px-4 flex sticky top-0 z-10">
        <h3 className="font-semibold text-lg">Instructions</h3>
        <p></p>
      </div>

      {/* Contenido del componente */}
      <div className="prose py-2 px-4 text-sm text-muted-foreground" dangerouslySetInnerHTML={{__html: description}}>
      </div>
    </div>
  )
}