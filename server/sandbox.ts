import path from 'node:path';
import crypto from "node:crypto";
import fs from 'node:fs/promises';
// import os from 'node:os';

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
    // workDir: string,
): Promise<CompileResult> {

    const submissionId = generateSubmissionID();

    // 1️⃣ Crear directorio de trabajo
    const { workDir: finalWorkDir, sourcePath } = await ensureWorkDir(submissionId);

    // 2️⃣ Escribir el archivo main.c
    await fs.writeFile(sourcePath, sourceCode, {
        encoding: 'utf-8'
    });

    // 3️⃣ Resultado provisional (aun no se compila)
    return {
        success: false,
        stdout: '',
        stderr: '',
        timeout: false,
    };
}

export async function runTest(
    binaryPath: string,
    input: string,
    timeoutMs: number,
): Promise<RunResult> {  
    // TODO Implementar funcionalidad para compilar main
}

function generateSubmissionID(): string {
    // Obtenemos la fecha
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2,"0"); // Funcion anonima para normalizar a 2 digitos

    const timestamp = 
        now.getUTCFullYear().toString() +
        pad(now.getUTCMonth()) +
        pad(now.getUTCDay()) +
        "T" +
        pad(now.getUTCHours()) +
        pad(now.getUTCMinutes()) +
        pad(now.getUTCSeconds());

    const randomHex = crypto.randomBytes(3).toString("hex");

    return `${timestamp}-${randomHex}`;
}

function getBinaryName(): string {
    // Si en el futuro queremos diferenciar por OS:
    // return os.platform() === 'win32' ? 'main.exe' : 'main';
    return 'main'
}

async function ensureWorkDir(submissionId: string) {
    const workDir = path.join(TMP_BASE_DIR, submissionId);
    await fs.mkdir(workDir, {recursive: true});

    const sourcePath = path.join(workDir, 'main.c');
    const binaryPath = path.join(workDir, getBinaryName());

    return {workDir, sourcePath, binaryPath};
}