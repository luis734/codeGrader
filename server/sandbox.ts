import path from 'node:path';
import crypto from "node:crypto";
import fs from 'node:fs/promises';
import {spawn} from 'node:child_process';
import os from 'node:os';

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
    const { workDir: finalWorkDir, sourcePath, binaryPath } = await ensureWorkDir(submissionId);

    // 2️⃣ Escribir el archivo main.c
    await fs.writeFile(sourcePath, sourceCode, {
        encoding: 'utf-8'
    });

    // 3️⃣ Compiulamos y devolvemos el resultado
    return new Promise<CompileResult> ((resolve) => {
        const args = [
            sourcePath,
            '-std=c11',
            '-O2',
            '-Wall',
            '-Wextra',
            '-o',
            binaryPath
        ];

        const gcc = spawn('gcc', args, {
            cwd: finalWorkDir,
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        let stdout = '';
        let stderr = '';
        let timeout = false;

        // Captura de salida
        gcc.stdout.on('data', (d) => stdout += d.toString());
        gcc.stderr.on('data', (d) => stderr += d.toString());

        // Timeout
        const timer = setTimeout(() => {
            timeout = true;
            gcc.kill('SIGKILL');
        }, 2000);

        gcc.on('close', (exitCode) => {
            clearTimeout(timer);

            resolve({
                success: exitCode === 0 && !timeout,
                stdout,
                stderr,
                binaryPath: exitCode === 0 ? binaryPath : undefined,
                timeout,
            });
        });
    });
}

export async function runTest(
    binaryPath: string,
    input: string,
    timeoutMs: number,
): Promise<RunResult> {  
    return new Promise<RunResult>((resolve) => {
        const normalizedPath = path.resolve(binaryPath);
        const workDir = path.dirname(normalizedPath);
        
        const test = spawn(normalizedPath, [], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: workDir,
        });

        let stdout = '';
        let stderr = '';
        let timeout = false;

        const timer = setTimeout(() => {
            timeout = true;
            test.kill('SIGKILL');
        }, timeoutMs);

        // Manejar errores de spawn
        test.on('error', (err: any) => {
            clearTimeout(timer);
            resolve({
                stdout: '',
                stderr: `Error al ejecutar: ${err.message}`,
                exitCode: null,
                timeout: false,
            });
        });

        // Captura de salida
        test.stdout.on('data', (d) => stdout += d.toString());
        test.stderr.on('data', (d) => stderr += d.toString());

        // Escribir el input al stdin del proceso
        if (input) {
            test.stdin.write(input);
        }
        test.stdin.end();

        test.on('close', (exitCode) => {
            clearTimeout(timer);
            resolve({
                exitCode,
                stdout,
                stderr,
                timeout,
            });
        });
    });
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
    return os.platform() === 'win32' ? 'main.exe' : 'main';
}

async function ensureWorkDir(submissionId: string) {
    const workDir = path.join(TMP_BASE_DIR, submissionId);
    await fs.mkdir(workDir, {recursive: true});

    const sourcePath = path.join(workDir, 'main.c');
    const binaryPath = path.join(workDir, getBinaryName());

    return {workDir, sourcePath, binaryPath};
}