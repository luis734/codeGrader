import { compileC } from "./sandbox";

// Pequeño helper para imprimir resultados de forma legible
function logResult(label: string, result: any) {
  console.log(`\n=== ${label} ===`);
  console.log("success:", result.success);
  console.log("stdout:\n", result.stdout);
  console.log("stderr:\n", result.stderr);
  console.log("binaryPath:", result.binaryPath);
  console.log("timeout:", result.timeout);
}

async function main() {
  // Caso 1: Código válido
  const helloWorld = `#include <stdio.h>
int main() {
  printf("Hola mundo\\n");
  return 0;
}
`;

  const okResult = await compileC(helloWorld);
  logResult("Compilación exitosa esperada", okResult);

  // Caso 2: Código con error de compilación
  const badCode = `int main() {
  printf("Hola
}
`;

  const badResult = await compileC(badCode);
  logResult("Compilación con error esperada", badResult);
}

main().catch((err) => {
  console.error("Fallo en test-compilation:", err);
  process.exit(1);
});
