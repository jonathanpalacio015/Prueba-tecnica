const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'empleados_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Manejar errores de conexión
pool.on('error', (err) => {
  console.error('Error en pool de conexión:', err.code);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Conexión a BD perdida');
    process.exit(1);
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Demasiadas conexiones a BD');
  }
  if (err.code === 'ER_AUTHENTICATION_FAILED') {
    console.error('Error de autenticación en BD');
    process.exit(1);
  }
});

// Verificar conexión al iniciar
pool.getConnection().then(conn => {
  console.log('✓ Conectado a BD: ' + (process.env.DB_NAME || 'empleados_db'));
  conn.release();
}).catch(err => {
  console.error('✗ Error conectando a BD:', err.message);
  process.exit(1);
});

module.exports = pool;
