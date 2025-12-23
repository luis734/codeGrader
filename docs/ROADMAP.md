# Roadmap técnico – Code Grader

Este documento describe el plan de trabajo para convertir el prototipo actual en una plataforma funcional para evaluar programas en C.
La idea es avanzar por pasos pequeños, siempre con algo utilizable al final de cada bloque.

> Regla: Una vez creado este archivo, el agente (IA) no debe modificarlo directamente.
> Cualquier cambio se hará manualmente o con instrucciones explícitas tuyas.

---

## 1. Documentación básica

- [x] Crear/actualizar `README.md` con:
  - [x] Descripción general del proyecto.
  - [x] Tecnologías principales.
  - [x] Requisitos (Node, PostgreSQL, `DATABASE_URL`).
  - [x] Pasos para correr el proyecto en local.
- [x] Añadir enlace a este `ROADMAP.md` desde el `README.md`.

---

## 2. Sandbox mínimo para ejecutar C

**Objetivo**: Poder compilar y ejecutar código C de forma controlada desde el backend, sin exponer la máquina de forma peligrosa.

- [-] Crear módulo `server/sandbox.ts` con:
  - [ ] Función `compileC(sourceCode: string, workDir: string)` que:
    - [ ] Escriba `main.c` en un directorio temporal.
    - [ ] Llame a `gcc` (`child_process.spawn` o `execFile`).
    - [ ] Aplique timeout de compilación y capture stdout/stderr.
  - [ ] Función `runTest(binaryPath: string, input: string, timeoutMs: number)` que:
    - [ ] Ejecute el binario con `stdin` = `input`.
    - [ ] Aplique timeout corto (1–2s).
    - [ ] Devuelva `stdout`, `stderr`, código de salida y si hubo timeout.
- [ ] Definir convención de directorios temporales (`tmp/<submission-id>/`).
- [ ] Asegurar limpieza básica de archivos temporales (al terminar cada ejecución o por tarea periódica simple).

---

## 3. Formato de tests y motor de evaluación

**Objetivo**: Usar los tests guardados en la base (`tests` table) para alimentar el binario C y comparar salidas de forma consistente.

- [ ] Confirmar/definir formato de tests:
  - [ ] `tests.input`: texto completo que se envía a `stdin` (puede tener varias líneas).
  - [ ] `tests.expected`: salida esperada exacta en `stdout` (también multilínea).
- [ ] Crear función de normalización de salida:
  - [ ] Convertir `\r\n` a `\n`.
  - [ ] Eliminar espacios en blanco al final de cada línea.
  - [ ] Opcional: ignorar líneas vacías adicionales al final.
- [ ] Implementar comparación:
  - [ ] `compareOutput(actual: string, expected: string): boolean`.
- [ ] Crear endpoint en backend, por ejemplo `POST /api/assignments/:id/run`:
  - [ ] Recibe `{ code: string }`.
  - [ ] Busca tests en DB para esa asignación.
  - [ ] Compila una vez el código.
  - [ ] Ejecuta todos los tests (secuencialmente o con límite de concurrencia).
  - [ ] Devuelve lista de tests con:
    - [ ] `status: "passed" | "failed" | "error" | "timeout"`.
    - [ ] `input`, `expected`, `actual`, mensajes de error cuando aplique.
- [ ] Adaptar el frontend `EditorPage` para:
  - [ ] Reemplazar la simulación actual de tests por llamada al nuevo endpoint.
  - [ ] Seguir mostrando resultados en el componente `TestRunner`.

---

## 4. Problemas de ejemplo y flujo de envío

**Objetivo**: Tener 1–2 problemas de prueba totalmente funcionales, desde la creación hasta la corrección automática.

- [ ] Definir al menos 2 problemas en lenguaje natural (enunciado):
  - [ ] Problema 1: Suma de dos enteros.
  - [ ] Problema 2: Máximo de N números.
- [ ] Crear estas asignaciones en la app (o vía seed):
  - [ ] `assignments` con `starterCode` en C (plantilla de `main`).
  - [ ] `tests` con entradas y salidas esperadas bien definidas.
- [ ] Ajustar el flujo de envío:
  - [ ] Botón "Run tests" llama a `/run` y actualiza la UI.
  - [ ] Botón "Submit":
    - [ ] Envía a `/submit` el resumen (`passedTests`, `totalTests`, `status`, `score`, código fuente).
    - [ ] Actualiza el estado de la tarea en el dashboard.
- [ ] Probar el flujo completo con:
  - [ ] Solución correcta.
  - [ ] Solución con errores de compilación.
  - [ ] Solución con errores lógicos (tests que fallan).
  - [ ] Programa que se cuelga / entra en bucle (verificar timeout).

---

## 5. Hacerlo usable para alumnos (despliegue)

**Objetivo**: Tener una versión accesible para un grupo pequeño de alumnos, usando servicios de bajo costo o gratuitos.

- [ ] Elegir proveedor de base de datos PostgreSQL gestionado (Neon, Supabase, Railway, etc.) y crear instancia.
- [ ] Configurar `DATABASE_URL` en el servicio de backend.
- [ ] Configurar despliegue del servidor Node:
  - [ ] Importar repo desde GitHub.
  - [ ] Definir comandos:
    - [ ] Build: `npm install && npm run build`.
    - [ ] Start: `npm run start`.
  - [ ] Variables de entorno: `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV=production`.
- [ ] Ejecutar migraciones (`npm run db:push`) contra la base desplegada.
- [ ] Ejecutar `npx tsx db/seed.ts` (local o remoto) para crear usuarios demo.
- [ ] Probar:
  - [ ] Login como admin.
  - [ ] Creación de asignaciones y tests.
  - [ ] Flujo de estudiante (run tests + submit).
- [ ] Escribir mini-guía para alumnos (puede ir en otro MD) con:
  - [ ] Cómo registrarse / credenciales.
  - [ ] Cómo abrir una tarea y enviar soluciones.
  - [ ] Límites (tiempo, formato de entrada/salida).

---

## 6. Mejoras futuras (ideas)

- [ ] Soporte para otros lenguajes (C++, Python, etc.).
- [ ] Estadísticas por alumno y por tarea.
- [ ] Exportar calificaciones.
- [ ] Rúbricas y feedback textual automático.
