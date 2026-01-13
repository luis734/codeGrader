# Progreso PASO 2 – Sandbox mínimo para ejecutar C

## 1. ¿Qué es `server/sandbox.ts` y por qué existe?

La idea del PASO 2 del roadmap es tener **un módulo de backend especializado** que se encargue de **compilar y ejecutar código C de forma controlada**, sin que el resto del servidor tenga que saber detalles de `gcc`, procesos, timeouts, etc.

Podemos pensar en `server/sandbox.ts` como un **"servicio interno"** del backend que hace estas funciones:

- Recibe **código fuente en C** (un string) y una carpeta de trabajo.
- Se encarga de **invocar a `gcc`** para compilar ese código.
- Si la compilación tuvo éxito, proporciona la **ruta del binario** resultante.
- Luego, dado un binario y un input, lo **ejecuta con límites de tiempo** y devuelve `stdout`, `stderr`, código de salida y si hubo timeout.

No es exactamente un "modelo" (no habla con la base de datos) ni un cliente de API externa. Es más bien una **capa de lógica de negocio técnica**: el lugar donde concentramos todo lo relacionado con ejecución segura y limitada de programas C.

Más adelante, los **endpoints `/api/...`** usarán este módulo para:

- Compilar el código que envía el estudiante.
- Ejecutar ese binario contra los tests definidos en la base de datos.
- Reportar al frontend si los tests pasaron o fallaron, sin exponer detalles peligrosos del sistema.

## 2. Estructura general que vamos a construir

El objetivo final de este paso es tener algo como:

- Archivo: `server/sandbox.ts`.
- Contenido lógico (interfaces aproximadas):
  - `compileC(sourceCode: string, workDir: string)` → compila `main.c` en un directorio temporal.
  - `runTest(binaryPath: string, input: string, timeoutMs: number)` → ejecuta el binario con un input y timeout.
- Convención de directorios temporales:
  - Base: `tmp/` en la raíz del proyecto.
  - Por envío: `tmp/<submission-id>/`.
- Estrategia de limpieza:
  - Borrar `tmp/<submission-id>/` al terminar de usarlo (MVP simple).

### Cómo encaja con el servidor Express

Actualmente, `server/index.ts` inicializa la app Express y delega la definición de rutas en `registerRoutes`. En el futuro cercano, el flujo será algo como:

1. El frontend hace un `POST /api/assignments/:id/run` con `{ code: string }`.
2. El controlador de esa ruta (en `routes`) hace lo siguiente:
   - Crea un `submissionId` y un directorio de trabajo: `tmp/<submission-id>/`.
   - Llama a `compileC(code, workDir)` del módulo `sandbox`.
   - Si compila bien, llama a `runTest(binaryPath, input, timeoutMs)` una vez por cada test.
   - Junta los resultados y responde al cliente.
3. Desde el punto de vista de `index.ts`, todo esto es invisible: solo ve que se definieron rutas `/api/...` que responden JSON.

De esta forma, **la responsabilidad de ejecutar C está encapsulada** en `sandbox.ts`, y los controladores de API (`routes`) se mantienen relativamente limpios.

## 3. Plan paso a paso (qué vamos a hacer y por qué)

### Paso 1 – Definir el rol del módulo `sandbox`

- **Qué**: Acordar que `sandbox.ts` será el lugar donde:
  - Se define la interfaz para compilar C (`compileC`).
  - Se define la interfaz para ejecutar binarios con límite de tiempo (`runTest`).
- **Por qué**:
  - Para separar claramente la lógica de "ejecutar código no confiable" del resto del servidor.
  - Para que, si en el futuro cambiamos la implementación (por ejemplo, Docker, contenedores, otra tecnología), solo tengamos que tocar este módulo.

### Paso 2 – Diseñar la firma de las funciones

- **Qué**:
  - Decidir los tipos de entrada y salida de:
    - `compileC(sourceCode: string, workDir: string)`.
    - `runTest(binaryPath: string, input: string, timeoutMs: number)`.
  - Incluir en los resultados campos como:
    - `success`, `stdout`, `stderr`, `binaryPath`, `exitCode`, `timeout`.
- **Por qué**:
  - Para que el resto del backend (punto 3 del roadmap) pueda usar estas funciones sin depender de detalles internos.
  - Para poder diferenciar claramente entre:
    - Error de compilación.
    - Error de ejecución.
    - Timeout.

### Paso 3 – Definir la convención de directorios temporales

- **Qué**:
  - Usar `tmp/` como carpeta base dentro del proyecto.
  - Para cada ejecución, crear un subdirectorio `tmp/<submission-id>/`.
  - Dentro de ese directorio, escribir `main.c` y el binario resultante (`main`).
- **Por qué**:
  - Para aislar los archivos de cada envío.
  - Para poder borrar con seguridad **solo** lo que pertenece a un envío específico.
  - Para evitar mezclar archivos de distintos usuarios o ejecuciones.

### Paso 4 – Implementar la lógica de compilación (conceptualmente)

- **Qué** hará `compileC` (a nivel de pasos lógicos):
  1. Crear el directorio `workDir` si no existe.
  2. Escribir `main.c` en ese directorio con el contenido de `sourceCode`.
  3. Llamar a `gcc` usando `child_process.spawn` o `execFile` **sin shell**.
  4. Aplicar un timeout de compilación (por ejemplo, 5s).
  5. Capturar `stdout` y `stderr`.
  6. Devolver un objeto indicando si la compilación tuvo éxito y, en ese caso, la ruta del binario.
- **Por qué**:
  - Es la forma estándar de compilar C desde Node.js.
  - Usar `spawn`/`execFile` sin `shell` reduce el riesgo de inyección de comandos.
  - El timeout evita que compilaciones muy pesadas o maliciosas bloqueen el servidor.

### Paso 5 – Implementar la lógica de ejecución de tests (conceptualmente)

- **Qué** hará `runTest` (a nivel de pasos lógicos):
  1. Ejecutar el binario (`binaryPath`) con `child_process.spawn`.
  2. Enviar `input` al `stdin` del proceso hijo.
  3. Capturar `stdout` y `stderr`.
  4. Aplicar un timeout corto (1–2 segundos) para evitar bucles infinitos.
  5. Si el proceso termina a tiempo, devolver `stdout`, `stderr`, `exitCode`, `timeout = false`.
  6. Si se vence el timeout, matar el proceso y devolver `timeout = true`.
- **Por qué**:
  - Para poder simular la ejecución del programa del alumno con entradas específicas (los tests).
  - Para proteger el servidor de programas que se cuelgan o consumen CPU de forma indefinida.

### Paso 6 – Limpieza de archivos temporales (MVP)

- **Qué**:
  - Después de terminar todas las ejecuciones relacionadas a un `submissionId`, borrar el directorio `tmp/<submission-id>/`.
  - Usar una operación recursiva con `force: true` para simplificar.
- **Por qué**:
  - Para no llenar el disco con archivos de compilaciones viejas.
  - Para reducir posibles riesgos si alguien llegara a acceder a esos archivos.

### Paso 7 – Pruebas manuales simples

- **Qué** (a nivel conceptual):
  - Crear uno o varios scripts de prueba (por ejemplo, un pequeño `sandbox-test.ts`) que:
    - Llame a `compileC` con un "Hello World" en C y verifique que compila.
    - Llame a `runTest` sin input y verifique que devuelve `stdout` esperado.
    - Pruebe un código con error de compilación y verifique que `stderr` tiene el mensaje de error.
    - Pruebe un programa con bucle infinito y verifique que el timeout funciona.
- **Por qué**:
  - Para validar el comportamiento del módulo `sandbox` antes de conectarlo al resto de la app.
  - Para tener ejemplos concretos que te ayuden a entender y depurar.

## 4. Checklist del PASO 2 (Sandbox mínimo para ejecutar C)

Esta lista está pensada para que marques los ítems conforme avances. Está alineada con el `ROADMAP.md`, pero más detallada a nivel técnico.

### Diseño y concepto

- [x] Entender y documentar el rol de `server/sandbox.ts` como servicio interno de compilación/ejecución.
- [x] Definir las firmas de las funciones principales (`compileC`, `runTest`) y sus tipos de retorno.

### Directorios temporales

- [x] Elegir la ruta base para temporales (`tmp/`).
- [x] Definir el formato de `submissionId` (por ahora puede ser algo simple: timestamp + 3 bytes random en hexadecimal).
- [x] Acordar la convención `tmp/<submission-id>/` y documentarla.

### Lógica de compilación (conceptual + luego implementación)

- [x] Crear directorio de trabajo si no existe.
- [x] Escribir `main.c` en el directorio de trabajo.
- [x] Llamar a `gcc` mediante `child_process.spawn` o `execFile`, sin `shell`.
- [x] Implementar timeout de compilación. (2 segundos).
- [x] Capturar `stdout` y `stderr`.
- [x] Devolver un resultado que indique éxito/fracaso y `binaryPath` cuando aplique.

### Lógica de ejecución de tests (conceptual + luego implementación)

- [x] Ejecutar el binario (`binaryPath`) con `spawn`.
- [x] Enviar `input` al `stdin` del proceso.
- [x] Capturar `stdout` y `stderr`.
- [x] Implementar timeout de ejecución (1–2 segundos).
- [x] Devolver `stdout`, `stderr`, `exitCode` y `timeout`.

### Limpieza y seguridad básica

- [-] Borrar el directorio `tmp/<submission-id>/` al terminar todas las ejecuciones relacionadas.
- [x] Evitar usar rutas que vengan directamente del usuario (siempre generadas por el servidor).
- [x] Asegurarse de no usar `exec` con comandos construidos a partir de strings peligrosos.

### Pruebas manuales

- [x] Probar compilación y ejecución de un programa en C que imprime "Hello World".
- [x] Probar un código con error de compilación y revisar que el error se propaga correctamente.
- [x] Probar un programa con bucle infinito para verificar que el timeout de ejecución funciona.

Cuando todos estos puntos estén marcados, podrás considerar que el **PASO 2 (Sandbox mínimo para ejecutar C)** está completado a nivel de backend, y estarás listo para avanzar al **PASO 3 (Formato de tests y motor de evaluación)**, que reutilizará directamente las funciones de este módulo `sandbox`. 
