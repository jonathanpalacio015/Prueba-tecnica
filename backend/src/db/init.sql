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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_email (email),
  KEY idx_activo (activo),
  KEY idx_nombre (nombre),
  KEY idx_apellido (apellido),
  KEY idx_departamento (departamento),
  KEY idx_activo_nombre (activo, nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
