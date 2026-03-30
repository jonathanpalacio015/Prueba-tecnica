# Prueba Técnica - Módulo Empleados

## Levantar proyecto
```bash
docker-compose up --build
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## Requisitos Implementados

### Backend
1. **Soft Delete**: Los empleados se marcan como `activo = false` en lugar de eliminarse físicamente. Permite auditoría y referencias históricas.
2. **Filtrado de Activos**: El endpoint `/api/empleados` devuelve solo empleados con `activo = true`.
3. **Paginación**: Soporta parámetros `page` y `limit`. Ejemplo: `/api/empleados?page=1&limit=10`
4. **Búsqueda por Nombre**: Búsqueda LIKE en `nombre` y `apellido`. Ejemplo: `/api/empleados?nombre=Juan`
5. **Filtro por Departamento**: Ejemplo: `/api/empleados?departamento=TI`
6. **Validación de Datos**: Middleware que valida que `nombre`, `apellido` y `email` estén presentes en POST/PUT.
7. **Endpoint de Conteo**: `/api/empleados/count` devuelve el total de registros (respeta filtros).

### Frontend
1. **Búsqueda en Tiempo Real**: Los usuarios pueden filtrar por nombre/departamento sin recargar.
2. **Paginación**: Botones de anterior/siguiente con indicador de página actual y total.
3. **Confirmación ante Eliminación**: `window.confirm()` evita eliminaciones accidentales.
4. **Listado de Activos**: Solo muestra empleados con `activo = true`.

## Decisiones Técnicas

### Por qué Soft Delete
- **Auditoría**: Mantener registro histórico de todos los empleados alguna vez ingresados.
- **Relaciones**: Evita problemas de integridad referencial si hay otros módulos dependientes.
- **Recuperabilidad**: Permite reactivar empleados si fue una eliminación accidental.
- **Cumplimiento Legal**: Muchas jurisdicciones requieren mantener históricos de empleados.

### Por qué Paginación
- **Performance**: No cargar 10,000+ registros en una sola consulta.
- **UX**: Interfaz más responsive y fluida.
- **Escalabilidad**: Sistema preparado para crecer sin degradación.

### Validación en Backend
- La validación ocurre en el middleware antes de llegar al controlador.
- Evita duplicación de lógica y garantiza consistencia.
- `email` es validado por el middleware aunque la BD no tenga constraint UNIQUE de momento.

### Búsqueda LIKE vs Índices
- LIKE funciona bien para datasets pequeños/medianos.
- Para millones de registros, consideraría full-text search o Elasticsearch.

## Buenas Prácticas Implementables

### 8. Logging Estructurado
Usar `winston` o `pino` en lugar de `console.log`:

```javascript
// backend/src/utils/logger.js
const pino = require('pino');
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});
module.exports = logger;

// backend/src/controllers/empleados.controller.js
const logger = require('../utils/logger');

const crear = async (req, res) => {
  try {
    logger.info({ email: req.body.email }, 'Creando empleado');
    const nuevo = await Model.crear(req.body);
    logger.info({ id: nuevo.id, email: nuevo.email }, 'Empleado creado exitosamente');
    res.status(201).json(nuevo);
  } catch (err) {
    logger.error(err, 'Error creando empleado');
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
```

**Ventajas:**
- Trazabilidad de operaciones críticas
- Formato JSON para análisis
- Niveles de severidad (debug, info, warn, error)
- Integración con sistemas de monitoreo (Datadog, New Relic, etc.)

---

### 9. Testing (Unit, Integration, E2E)

#### Tests Unitarios (Jest)
```javascript
// tests/unit/models/empleado.model.test.js
const Model = require('../../../src/models/empleado.model');

describe('Empleado Model', () => {
  test('debe formatear fecha_ingreso como ISO string', async () => {
    const empleado = {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@test.com',
      fecha_ingreso: new Date('2026-03-30')
    };
    
    const result = await Model.crear(empleado);
    expect(result.fecha_ingreso).toBe('2026-03-30');
  });
});
```

#### Tests de Integración (Supertest)
```javascript
// tests/integration/empleados.test.js
const request = require('supertest');
const app = require('../../../src/index');

describe('POST /api/empleados', () => {
  it('debe crear un empleado con datos válidos', async () => {
    const res = await request(app)
      .post('/api/empleados')
      .send({
        nombre: 'Juan',
        apellido: 'Pérez',
        email: `test-${Date.now()}@test.com`,
        departamento: 'TI',
        cargo: 'Developer'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.nombre).toBe('Juan');
  });
  
  it('debe rechazar email duplicado con 409', async () => {
    const email = `dup-${Date.now()}@test.com`;
    
    await request(app)
      .post('/api/empleados')
      .send({
        nombre: 'Persona1',
        apellido: 'Test',
        email: email
      });
    
    const res = await request(app)
      .post('/api/empleados')
      .send({
        nombre: 'Persona2',
        apellido: 'Test',
        email: email
      });
    
    expect(res.status).toBe(409);
    expect(res.body.error).toContain('Email ya existe');
  });
  
  it('debe rechazar email inválido con 400', async () => {
    const res = await request(app)
      .post('/api/empleados')
      .send({
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'email-invalido'
      });
    
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Email inválido');
  });
  
  it('debe rechazar campos requeridos faltantes', async () => {
    const res = await request(app)
      .post('/api/empleados')
      .send({ nombre: 'Juan' });
    
    expect(res.status).toBe(400);
  });
});

describe('GET /api/empleados', () => {
  it('debe soportar paginación', async () => {
    const res = await request(app)
      .get('/api/empleados?page=1&limit=5');
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(5);
  });
  
  it('debe filtrar por nombre', async () => {
    const res = await request(app)
      .get('/api/empleados?nombre=Juan');
    
    expect(res.status).toBe(200);
    res.body.forEach(emp => {
      expect(emp.nombre.toLowerCase()).toContain('juan');
    });
  });
});

describe('SOFT DELETE /api/empleados/:id', () => {
  it('debe marcar como inactivo sin eliminar', async () => {
    // Crear empleado
    const createRes = await request(app)
      .post('/api/empleados')
      .send({
        nombre: 'ToDelete',
        apellido: 'Test',
        email: `delete-${Date.now()}@test.com`
      });
    
    const empId = createRes.body.id;
    
    // Eliminar (soft delete)
    const deleteRes = await request(app)
      .delete(`/api/empleados/${empId}`);
    
    expect(deleteRes.status).toBe(204);
    
    // Verificar que existe pero está inactivo
    const getRes = await request(app)
      .get(`/api/empleados/${empId}`);
    
    expect(getRes.body.activo).toBe(false);
  });
});
```

#### Ejecutar Tests
```bash
# Package.json
"scripts": {
  "test": "jest --coverage",
  "test:watch": "jest --watch",
  "test:integration": "jest tests/integration",
  "test:all": "npm run test && npm run test:integration"
}
```

---

### 10. DTOs (Data Transfer Objects)
Separar datos de entrada de la lógica de negocio:

```javascript
// backend/src/dtos/createEmpleado.dto.js
class CreateEmpleadoDTO {
  constructor(data) {
    this.nombre = data.nombre?.trim();
    this.apellido = data.apellido?.trim();
    this.email = data.email?.toLowerCase().trim();
    this.departamento = data.departamento?.trim() || null;
    this.cargo = data.cargo?.trim() || null;
    this.fecha_ingreso = data.fecha_ingreso || null;
    this.activo = true;
  }
  
  isValid() {
    return this.nombre && this.apellido && this.email;
  }
}

module.exports = CreateEmpleadoDTO;

// backend/src/controllers/empleados.controller.js
const CreateEmpleadoDTO = require('../dtos/createEmpleado.dto');

const crear = async (req, res) => {
  try {
    const dto = new CreateEmpleadoDTO(req.body);
    if (!dto.isValid()) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }
    const nuevo = await Model.crear(dto);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

**Beneficios:**
- Normalización de datos (trim, lowercase)
- Validación tipo-segura
- Fácil de testear
- Separación clara de responsabilidades

---

### 11. Índices en Base de Datos
Mejorar performance de queries:

```sql
-- backend/src/db/init.sql
CREATE DATABASE IF NOT EXISTS empleados_db;
USE empleados_db;

CREATE TABLE IF NOT EXISTS empleados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  departamento VARCHAR(100),
  cargo VARCHAR(100),
  fecha_ingreso DATE,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ÍNDICES para optimizar búsquedas
CREATE INDEX idx_email ON empleados(email);
CREATE INDEX idx_activo ON empleados(activo);
CREATE INDEX idx_nombre ON empleados(nombre);
CREATE INDEX idx_apellido ON empleados(apellido);
CREATE INDEX idx_departamento ON empleados(departamento);
CREATE INDEX idx_activo_nombre ON empleados(activo, nombre); -- Composite index
```

**Impacto de Performance:**
```
Sin índice:  SELECT * FROM empleados WHERE nombre LIKE 'Juan%' -- O(n)
Con índice:  SELECT * FROM empleados WHERE nombre LIKE 'Juan%' -- O(log n)

Para 1M registros:
- Sin índice: ~1000ms
- Con índice: ~10ms (100x más rápido)
```

Verificar índices:
```sql
-- Ver índices creados
SHOW INDEX FROM empleados;

-- Analizar query plan
EXPLAIN SELECT * FROM empleados WHERE activo = TRUE AND nombre LIKE 'Juan%';
```

---

### 12. Response Standardizado
Mantener consistencia en todas las respuestas API:

```javascript
// backend/src/utils/apiResponse.js
class ApiResponse {
  /**
   * @param {any} data - Datos a retornar
   * @param {string} message - Mensaje descriptivo
   * @param {number} statusCode - HTTP status code
   */
  static success(data, message = 'Operación exitosa', statusCode = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * @param {string} message - Mensaje de error
   * @param {number} statusCode - HTTP status code
   * @param {any} errors - Detalles de errores (validación, etc.)
   */
  static error(message, statusCode = 500, errors = null) {
    return {
      success: false,
      statusCode,
      message,
      errors,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = ApiResponse;

// backend/src/controllers/empleados.controller.js
const ApiResponse = require('../utils/apiResponse');

const listar = async (req, res) => {
  try {
    const rows = await Model.listar(req.query);
    res.json(ApiResponse.success(
      rows,
      'Empleados listados correctamente',
      200
    ));
  } catch (err) {
    res.status(500).json(ApiResponse.error(
      'Error al listar empleados',
      500,
      { details: err.message }
    ));
  }
};

const crear = async (req, res) => {
  try {
    const nuevo = await Model.crear(req.body);
    res.status(201).json(ApiResponse.success(
      nuevo,
      'Empleado creado exitosamente',
      201
    ));
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json(ApiResponse.error(
        'El email ya existe',
        409,
        { field: 'email', value: req.body.email }
      ));
    }
    res.status(500).json(ApiResponse.error(
      'Error al crear empleado',
      500
    ));
  }
};
```

**Ejemplo de Respuesta:**
```json
// Éxito (200)
{
  "success": true,
  "statusCode": 201,
  "message": "Empleado creado exitosamente",
  "data": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@test.com",
    "activo": true
  },
  "timestamp": "2026-03-30T22:40:00.000Z"
}

// Error (400)
{
  "success": false,
  "statusCode": 400,
  "message": "Email inválido",
  "errors": {
    "field": "email",
    "value": "correo-sin-formato"
  },
  "timestamp": "2026-03-30T22:40:00.000Z"
}

// Error (409 - Conflicto)
{
  "success": false,
  "statusCode": 409,
  "message": "El email ya existe",
  "errors": {
    "field": "email",
    "value": "duplicado@test.com"
  },
  "timestamp": "2026-03-30T22:40:00.000Z"
}
```

---

## Mejoras Futuras

1. **Validación más Robusta**:
   - Regex para email
   - Longitud mínima/máxima
   - Validar fecha_ingreso (no puede ser en el futuro)
   - Considerar librería como `joi` o `express-validator`

2. **Seguridad**:
   - Autenticación (JWT)
   - Autorización por rol (admin/usuario)
   - Rate limiting
   - CORS configurado correctamente

3. **Búsqueda Avanzada**:
   - Full-text search
   - Filtros múltiples (rango de fechas, etc.)
   - Ordenamiento por columna

4. **Logging y Monitoreo**:
   - Winston o Pino para logs
   - Trackear quién creó/modificó cada registro
   - Timestamp de auditoría

5. **UI/UX**:
   - Tooltips informativos
   - Mensajes de éxito/error más claros
   - Debouncing en búsqueda para reducir requests
   - Loading skeletons en tabla
   - Exportación a CSV/Excel

6. **Testing**:
   - Tests unitarios (Jest)
   - Tests de integración (Supertest)
   - Tests E2E (Cypress/Playwright)

7. **Base de Datos**:
   - Agregar índices en `nombre`, `departamento`, `activo`.
   - Considerar particionamiento si tabla crece mucho.
   - Backup automático.

## Estructura del Proyecto

```
backend/
├── src/
│   ├── controllers/       # Lógica de requests/responses
│   ├── models/           # Queries a DB
│   ├── routes/           # Definición de endpoints
│   ├── middlewares/      # Validación, auth, etc.
│   ├── db/              # Conexión a base de datos
│   └── index.js         # Entry point

frontend/
├── src/
│   ├── components/      # Reutilizables (Form, Table)
│   ├── pages/          # Páginas (EmpleadosPage)
│   ├── services/       # Llamadas a API
│   └── main.jsx        # Entry point
```

## Notas Finales

- Este módulo está preparado para escalabilidad básica.
- Los filtros en el backend evitan traer datos innecesarios.
- La confirmación en UI previene errores de usuario.
- El código es modular y fácil de testear/extender.

