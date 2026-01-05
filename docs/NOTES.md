## Resumen de sesión – Sandbox / PASO 2

- **Decisiones tomadas**
  - El binario se ejecuta con un timeout y pasandole la entrada recibida en el parametro.
  - `runTest` ejecuta el binario con las entradas recibidas y devuelve el resultado en `stdout, stderr, exitCode, timeout`.
  - Se probará `runTest` mediante un script ad-hoc en `server/test-compilation.ts`.

- **Qué quedó implementado**
  - `runTest` ya evalua el binario con la entrada, devolviendo `stdout/stderr/exitCode/timeout`.
  - Se añadió `server/test-compilation.ts` que corre un casos válido pasando un numero y leyendolo desde el binario `stdout`.
  - Limpieza automática de `tmp/<submission-id>/` tras las pruebas.
  - Ajustar errores visuales:
    - El editor no tiene scroll, (posiblemente el test suite tampoco).
    - En el dashboard los datos no se despliegan correctamente.

- **Qué quedó pendiente**
  - Agregar una seccion para tareas completadas, vencidas y proximas.

---

## Resumen de sesión – Operaciones de Submissions

- **Decisiones tomadas**
  - Las submissions del estudiante se incluyen directamente en la respuesta de `/api/assignments` como propiedad `submission`.
  - Solo se actualiza la submission si está en estado "in_progress" y el nuevo score es mejor que el existente.
  - Las submissions completadas ("completed") no se sobrescriben para proteger el mejor resultado.

- **Qué quedó implementado**
  - Se agregó el tipo `ApiSubmission` en `client/src/lib/api.ts`.
  - Se agregaron operaciones básicas de submissions en el contexto (`refreshSubmissions`, `submitAssignment`).
  - Se modificó el servidor para incluir la submission completa en la respuesta de assignments para estudiantes.
  - Se actualizó `refreshSubmissions()` para extraer submissions de los assignments.
  - Se implementó lógica para actualizar submissions solo si están "in_progress" y el score es mejor.
  - El editor ahora carga automáticamente el código de la submission previa si existe, o el `starterCode` si no.
  - Se actualiza automáticamente el dashboard después de guardar una submission.
  - Se agrego el input y etiquetas para mostrar la fecha de vencimiento.

- **Qué quedó pendiente**
  - (Ver sección anterior)