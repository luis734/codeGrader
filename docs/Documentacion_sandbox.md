# Manejo del sandbox

## Resumen del documento

Este documento describe **cómo el sandbox maneja los archivos temporales** que necesita para compilar y ejecutar programas en C.  
Por ahora se centra en dos decisiones principales:

- **Ruta base de temporales**: en qué carpeta se guardan los archivos temporales.
- **Convención de nombrado de envíos (`submissionId`) y archivos dentro de cada envío**.

Al final se incluyen **extras técnicos** con detalles de implementación y comandos útiles.

---

## Sección 1: Ruta de archivos temporales

El sandbox guarda todos sus archivos temporales dentro de una carpeta llamada `tmp/` en la raíz del proyecto.

- Carpeta base de temporales: `tmp/`
- Se calcula a partir del directorio donde corre el servidor (por ejemplo usando `process.cwd()` en Node.js).
- Cada envío tendrá su propia subcarpeta dentro de `tmp/` (ver siguiente sección).

Ejemplo de estructura de carpetas:

```text
tmp/
  20251223T153045-3fa9c1/
  20251223T153210-ab12ef/
  ...
```

---

## Sección 2: Convención de `submissionId` y archivos

Cada envío se identifica con un `submissionId` y tiene su propio directorio:

- Carpeta por envío: `tmp/<submission-id>/`
- Dentro de esa carpeta se guardan al menos:
  - `main.c`: código fuente en C.
  - `main` o `main.exe`: binario compilado.

### Formato de `submissionId`

El `submissionId` tiene el siguiente formato:

```text
<timestamp-compacto>-<random-hex>
```

Ejemplo:

```text
20251223T153045-3fa9c1
```

Esto combina:

- Fecha y hora en UTC: `YYYYMMDDThhmmss` (por ejemplo `20251223T153045`).
- Una parte aleatoria en hexadecimal (por ejemplo `3fa9c1`).

Ruta de ejemplo para un envío:

- Carpeta de trabajo: `tmp/20251223T153045-3fa9c1/`
- Archivo fuente: `tmp/20251223T153045-3fa9c1/main.c`
- Binario: `tmp/20251223T153045-3fa9c1/main` (o `main.exe` en Windows).

---

## Extras técnicos

### Extra 1: Definir y cambiar la ruta base de temporales

En el código del backend, la ruta base de temporales se puede definir así:

```ts
import path from "node:path";

export const TMP_BASE_DIR = path.join(process.cwd(), "tmp");
```

Si en algún momento se quiere cambiar la ubicación (por ejemplo a otro disco), se puede reemplazar por algo como:

```ts
// Ruta absoluta fija
export const TMP_BASE_DIR = "D:/code-grader-tmp";

// O usando una variable de entorno
export const TMP_BASE_DIR =
  process.env.SANDBOX_TMP_DIR ?? path.join(process.cwd(), "tmp");
```

Pasos típicos para mover la ruta de temporales:

1. Actualizar `TMP_BASE_DIR` en el código del backend. (Actualmente en ./server/sandbox.ts)
2. Crear o verificar que exista la carpeta nueva de temporales.
3. Asegurarse de que el usuario que ejecuta el servidor tiene permisos de lectura/escritura en esa carpeta.
4. Actualizar esta documentación si la ruta cambia de forma permanente.

### Extra 2: Rutas típicas dentro de `tmp/<submission-id>/`

Suponiendo que ya existe `TMP_BASE_DIR` y que tenemos un `submissionId`, las rutas más usadas serían:

```ts
import path from "node:path";

const workDir = path.join(TMP_BASE_DIR, submissionId);
const sourcePath = path.join(workDir, "main.c");
const binaryPath = path.join(workDir, "main"); // o "main.exe" en Windows
```

Estas rutas se usarán más adelante en la implementación de:

- Escritura de `main.c` en el sistema de archivos.
- Compilación con `gcc`.
- Ejecución del binario para correr los tests.