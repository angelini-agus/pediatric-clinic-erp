-- Script de inicialización de PostgreSQL para desarrollo local
-- Se ejecuta automáticamente al crear el contenedor por primera vez

-- Crear base de datos de testing
CREATE DATABASE pediatric_erp_test;

-- Configuraciones de seguridad y performance
ALTER SYSTEM SET log_min_duration_statement = '1000'; -- Loguear queries > 1s
ALTER SYSTEM SET timezone = 'America/Argentina/Buenos_Aires';
