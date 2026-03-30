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

