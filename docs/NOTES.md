## Resumen de sesión – Sandbox / PASO 2

- **Decisiones tomadas**
  - Se acordó usar `tmp/` en la raíz del proyecto como ruta base para todos los archivos temporales del sandbox.
  - Se decidió documentar el diseño del sandbox (incluyendo directorios temporales) en documentos dedicados (`Documentacion_sandbox.md` u otros), separando claramente concepto y detalles técnicos.

- **Qué quedó implementado**
  - Se creó y documentó la convención de usar una carpeta base `tmp/` para los temporales del sandbox (a nivel de diseño y documentación, no de código todavía).
  - Se empezó a estructurar la documentación del sandbox para describir objetivos, manejo de temporales y decisiones de diseño.

- **Qué quedó pendiente**
  - Definir el formato concreto de `submissionId` (por ahora se propone algo simple: timestamp + random) y reflejarlo en la documentación y en el código.
  - Documentar y formalizar la convención exacta `tmp/<submission-id>/` (qué se guarda ahí: `main.c`, binario, etc.) y cómo se limpia después de usarlo.
  - Implementar en código la creación de directorios de trabajo, escritura de `main.c`, compilación con `gcc`, timeouts y captura de `stdout`/`stderr`.

- **Qué sigue según `progreso-paso-2.md`**
  - Completar la sección de **Directorios temporales**:
    - Definir y documentar el formato de `submissionId`.
    - Acordar y documentar oficialmente la convención `tmp/<submission-id>/`.
  - Avanzar a la **Lógica de compilación**:
    - Crear el directorio de trabajo si no existe.
    - Escribir `main.c` en el directorio de trabajo.
    - Invocar `gcc` con `child_process.spawn` o `execFile` (sin `shell`), con timeout y captura de `stdout`/`stderr`.
    - Definir el resultado de `compileC` indicando éxito/fracaso y `binaryPath` cuando aplique.
  - Después, seguir con la **Lógica de ejecución de tests** y la **limpieza de archivos temporales**, tal como marca `progreso-paso-2.md`.


