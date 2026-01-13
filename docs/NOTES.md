## Decisiones tomadas
- Se decidió migrar de autenticación basada en **sessions** a **JWT** para reducir el número de peticiones innecesarias en hosting gratuito.
- Se optó por manejar el JWT en el **frontend** (localStorage) y enviarlo en la cabecera `Authorization: Bearer <token>`.
- Se mantuvo el endpoint `auth/me` como punto central para validar el token y obtener el usuario autenticado.
- Se separaron claramente los tipos de datos de **entrada (Input / DTO)** y **salida (Api / Response)** para evitar errores de tipado en TypeScript.
- Se corrigió el tipado del `AppContextType` para que coincida exactamente con la implementación real del contexto.

## Qué quedó implementado
- Backend:
  - Autenticación con JWT.
  - Middleware `requireAuth` que valida el token y agrega `req.user`.
  - Middleware `requireAdmin` basado en `req.user.role`.
  - Endpoint `auth/me` que devuelve el usuario a partir del token.
- Frontend:
  - Manejo del estado global del usuario con `React Context`.
  - Integración del JWT en el cliente (envío automático en cada request).
  - Lógica de carga inicial (`loadUser`) para validar sesión al montar la app.
  - Corrección de errores de tipado en `addAssignment` y `updateAssignment`.
  - Uso consistente de tipos (`AssignmentTestInput`, `ApiTest`, etc.).

## Qué queda pendiente
- Implementar **tests automáticos** para JWT:
  - Token válido
  - Token inválido
  - Token expirado
  - Request sin token

## Qué sigue según el roadmap
- Implementar testing (unitario y de integración) para autenticación y autorización.
- Agregar refresh token o estrategia de renovación si es necesario.
- Optimizar llamadas al backend para reducir consumo de requests.
- Endurecer seguridad:
  - Expiración corta de access token
  - Rotación de tokens
- Documentar flujo de autenticación (diagramas + README).

---
Estado actual: **Migración a JWT funcional y tipada correctamente.**