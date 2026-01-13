// Para ejecutar el archivo y correr la prueba del main ejecuta el comando: 
// * npx tsx server/test-compilation.ts
import path from 'node:path';
import { compileC, generateSubmissionID, runTest } from "../sandbox";

export const SANDBOX_BASE_DIR = path.join(process.cwd(), 'tmp');


// Pequeño helper para imprimir resultados de forma legible
function logResult(label: string, result: any) {
  console.log(`\n=== ${label} ===`);
  console.log("success:", result.success);
  console.log("stdout:\n", result.stdout);
  console.log("stderr:\n", result.stderr);
  console.log("binaryPath:", result.binaryPath);
  console.log("timeout:", result.timeout);
}

// Helper para imprimir resultados de un test
function testResult(label: string, result: any) {
    console.log(`\n=== ${label} ===`);
    console.log("stdout:\n", result.stdout);
    console.log("stderr:\n", result.stderr);
    console.log("exitCode:", result.exitCode);
    console.log("timeout:", result.timeout);
}

async function main() {
//     // * PRUEBA DE COMPILACIÓN
//   // Caso 1: Código válido
//   const helloWorld = `#include <stdio.h>
// int main() {
//   printf("Hola mundo\\n");
//   return 0;
// }
// `;

//   const okResult = await compileC(helloWorld);
//   logResult("Compilación exitosa esperada", okResult);

//   // Caso 2: Código con error de compilación
//   const badCode = `int main() {
//   printf("Hola
// }
// `;

//   const badResult = await compileC(badCode);
//   logResult("Compilación con error esperada", badResult);

    // * PRUEBA DE TESTS
    // Caso 1: Test valido
    const leerNum = `#include <stdio.h>
int main() {
    int num;
    scanf("%d", &num);
    printf("El numero es: %d\\n", num);
    return 0;
}`;
    
    // Creamos el directorio de trabajo
    const workDir = path.join(SANDBOX_BASE_DIR, generateSubmissionID());
    // Compilamos el codigo
    const result = await compileC(leerNum, workDir);
    logResult("Compilacion del codigo", result);

    // Ejecutamos un test solo si result.binaryPath está definido
    if (result.binaryPath) {
        const resultTest = await runTest(result.binaryPath, "6", 2000);
        testResult("Test con exito",resultTest);
    } else {
        console.error("No se encontró binaryPath para ejecutar el test.");
    }

}

main().catch((err) => {
  console.error("Fallo en test-compilation:", err);
  process.exit(1);
});
