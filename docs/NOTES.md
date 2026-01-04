## Resumen de sesión – Sandbox / PASO 2

- **Decisiones tomadas**
  - El binario se ejecuta con un timeout y pasandole la entrada recibida en el parametro.
  - `runTest` ejecuta el binario con las entradas recibidas y devuelve el resultado en `stdout, stderr, exitCode, timeout`.
  - Se probará `runTest` mediante un script ad-hoc en `server/test-compilation.ts`.

- **Qué quedó implementado**
  - `runTest` ya evalua el binario con la entrada, devolviendo `stdout/stderr/exitCode/timeout`.
  - Se añadió `server/test-compilation.ts` que corre un casos válido pasando un numero y leyendolo desde el binario `stdout`.

- **Qué quedó pendiente**
  - Limpieza automática de `tmp/<submission-id>/` tras las pruebas.

- **Qué sigue según `progreso-paso-2.md`**
    - Borrar el directorio `tmp/<submission-id>/` al terminar todas las ejecuciones relacionadas.
    - Evitar usar rutas que vengan directamente del usuario (siempre generadas por el servidor).
    - Asegurarse de no usar `exec` con comandos construidos a partir de strings peligrosos.