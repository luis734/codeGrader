import path from 'node:path';

const TMP_BASE_DIR = path.join(process.cwd(), 'tmp');

// ### Interfaces
export interface CompileResult {
    success: boolean;   // true si se compilo bien y genero el binario
    stdout: string;     // Salida estandar de gcc (a veces vacía)
    stderr: string;     // Mensaje de error/aviso de gcc
    binaryPath?: string;// Ruta al binario generado si success === true
    timeout: boolean;   // true si se excedio el tiempo limite de ejecucion
}

export interface RunResult {
    stdout: string;         // Salida del programa
    stderr: string;         // Errores o mensajes adicionales
    exitCode: number | null;// Codigo de salida del proceso, null si no se alcanza a obtener
    timeout: boolean;       // true si se excedio el tiempo limite de ejecucion
}

// ### Firmas de las funciones
export async function compileC(
    sourceCode: string,
    workDir: string,
): Promise<CompileResult> {
    // TODO Implementar funcionalidad para compilar main
}

export async function runTest(
    binaryPath: string,
    input: string,
    timeoutMs: number,
): Promise<RunResult> {  
    // TODO Implementar funcionalidad para compilar main
}