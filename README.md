# Code Grader (CodeCheck)

Plataforma web para evaluar automáticamente programas en C, pensada para cursos de programación básica/intermedia y como proyecto de portafolio.
Permite que un administrador cree tareas con casos de prueba, y que los estudiantes editen código C en el navegador, ejecuten tests y envíen sus soluciones.

> Nota: Actualmente la ejecución de C está simulada en el frontend. El roadmap incluye integrar compilación y ejecución real en el servidor.

---

## Tecnologías principales

- **Frontend**: React + TypeScript, Vite, Tailwind + componentes shadcn/ui.
- **Backend**: Express + TypeScript.
- **Base de datos**: PostgreSQL con Drizzle ORM.
- **Autenticación**: Sesiones con `express-session`.
- **Infraestructura**: Monorepo con cliente (`client/`), servidor (`server/`), schema compartido (`shared/`).

---

## Estructura rápida del proyecto

- `client/`: aplicación React (pantallas de login, dashboard, editor, admin).
- `server/`: servidor Express y configuración de Vite en desarrollo.
- `shared/schema.ts`: definición de tablas (users, assignments, tests, submissions).
- `db/`: conexión a la base y script de seed.
- `script/`: script de build para producción.
- `vite.config.ts`: configuración de Vite.

---

## Requisitos

- **Node.js** 20+ (recomendado) y **npm**.
- **PostgreSQL** accesible (local o remoto).
- Variable de entorno **`DATABASE_URL`** apuntando a tu base de datos, por ejemplo:

```bash
postgres://USUARIO:CONTRASEÑA@localhost:5432/codegrader
```

---

## Cómo correr el proyecto en local

1. **Clonar e instalar dependencias**

```bash
git clone <URL_DEL_REPO>
cd Code-Grader
npm install
```

2. **Configurar la base de datos**

Asegúrate de tener PostgreSQL corriendo y crea una base (por ejemplo `codegrader`).
Exporta la variable `DATABASE_URL` en tu terminal:

```bash
# Bash / Git Bash
export DATABASE_URL="postgres://USUARIO:CONTRASEÑA@localhost:5432/codegrader"
```

En PowerShell sería:

```powershell
$env:DATABASE_URL="postgres://USUARIO:CONTRASEÑA@localhost:5432/codegrader"
```

3. **Aplicar el schema (migraciones con Drizzle)**

```bash
npm run db:push
```

4. **Sembrar datos de ejemplo (usuarios demo)**

```bash
npx tsx db/seed.ts
```

Esto creará al menos:

- Admin: `admin@codecheck.com` / `admin123`
- Estudiante demo: `juan@university.edu` / `student123`

5. **Levantar el servidor en modo desarrollo**

```bash
npm run dev
```

- El servidor Express se levanta en el puerto `5000`.
- En modo desarrollo, Vite se integra automáticamente con el servidor.

Abre en el navegador:

```text
http://localhost:5000
```

---

## Flujo básico de uso

1. Entra como **admin** y crea tareas (assignments) con:
   - Título, descripción, fecha límite.
   - Código inicial en C (`starterCode`).
   - Tests (input / output esperado).
2. Entra como **estudiante**:
   - Ve las tareas en el dashboard.
   - Abre el editor (`/editor/:id`), escribe o sube un archivo `.c`, y ejecuta los tests.
3. El sistema guarda los envíos y su estado en la base de datos.

---

## Roadmap

El roadmap técnico detallado (sandbox para C, formato de tests, despliegue, etc.) está en:

- `docs/ROADMAP.md`

---

## Licencia

Este proyecto utiliza un modelo de licencia dual:

- Uso educativo y no comercial: permitido bajo
  Creative Commons BY-NC 4.0.
- Uso comercial: requiere una licencia comercial
  explícita otorgada por el autor.

Para más detalles, ver el archivo LICENSE.