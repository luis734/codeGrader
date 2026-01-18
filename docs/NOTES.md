## Decisiones tomadas
- Separar “Run Tests” de “Submit Solution”
  - El guardado debe ser explícito y controlado por el usuario.
- El guardado debe ser explícito y controlado por el usuario.
  - Se colocará en el panel derecho, debajo de Run Tests.

## Qué quedó implementado
- 🔐 Autenticación
  - Login funcional con JWT.
  - Token correctamente enviado en Authorization: Bearer <token>.
  - Middleware estable sin errores por undefined.
  - Endpoint /api/auth/me funcionando y validado.
- 🖥️ Frontend
  - fetchApi centralizado y corregido.
  - Manejo automático de sesión expirada.
  - Layout corregido para evitar errores por user.name.
  - Interfaz base del editor + test suite operativa.

## Qué queda pendiente
- Botón “Submit Solution”
  - Implementar el botón en el panel derecho.
  - Definir estados:
    - Disabled hasta pasar tests
    - Loading / Submitted
- Separación lógica backend
  - Evitar que Run Tests escriba en BD.
  - Crear flujo explícito de persistencia.
- Optimización de ejecución
  - Evitar recompilar si el código no cambia.
  - Evitar escrituras innecesarias en BD.
- Consistencia de datos
  - Unificar respuesta de login y auth/me (incluir name).

## Qué sigue según el roadmap
- Agregar botón Submit Solution
-  Ajustar UI para mostrar:
  - “Tests passed (not submitted)”
  - “Solution submitted"
---
Estado actual: **Migración a JWT funcional y tipada correctamente.**