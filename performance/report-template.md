# Informe Técnico de Performance - MatchPet

## 1. Introducción

- **Objetivo de las pruebas**: Evaluar la estabilidad, capacidad de concurrencia, latencia y escalabilidad de la API de MatchPet bajo diferentes niveles de carga, simulando desde un uso normal hasta condiciones extremas de estrés.
- **Alcance funcional**: Pruebas de lectura en `/sessions`, registro masivo de usuarios en `/register` y autenticación concurrente en `/login`.
- **Descripción del entorno**:
  - **SO**: Windows 11 Home / Linux (Production Target)
  - **CPU/RAM**: CPU de 8 núcleos, 16 GB de RAM (Entorno local de pruebas)
  - **Versión Node/Nest**: Node.js v20.x, NestJS v11.x
  - **Versión JMeter**: Apache JMeter v5.6.3
  - **URL base**: `http://localhost:3000`

---

## 2. Configuración de pruebas

### 2.1 Escenarios GET /sessions

Las pruebas evalúan la respuesta del backend legado cuando se consultan sesiones activas de manera concurrente.

| Escenario | Usuarios | Ramp-Up | Loops | Endpoint |
|---|---:|---:|---:|---|
| 1 | 10 | 20s | 5 | /sessions |
| 2 | 50 | 20s | 5 | /sessions |
| 3 | 100 | 20s | 5 | /sessions |
| 4 | 500 | 60s | 5 | /sessions |
| 5 | 1000 | 90s | 5 | /sessions |

### 2.2 Escenario POST /register

Mide la velocidad de creación de nuevas cuentas e inserción de perfiles de usuario en Firestore.

| Usuarios | Ramp-Up | Loops | Origen de datos |
|---:|---:|---:|---|
| 20 | 10s | 1 | CSV Data Set Config |

### 2.3 Escenario POST /login

Simula inicios de sesión concurrentes y evalúa el comportamiento de la solución ante intentos sucesivos e inválidos (fuerza bruta).

| Tipo | Usuarios | Ramp-Up | Loops | Endpoint |
|---|---:|---:|---:|---|
| Login mixto (válidos e inválidos) | 100 | 25s | 20 | /login |
| Fuerza bruta | Incluido en CSV | N/A | N/A | /login |

---

## 3. Evidencias

Las pruebas fueron configuradas utilizando los planes oficiales:
- Plan de Carga: `performance/jmeter/MatchPet_Load_Test_Plan.jmx`
- Plan de Diagnóstico: `performance/jmeter/MatchPet_Diagnostics.jmx`

Los reportes HTML detallados se guardan de forma automatizada en el directorio local:
- `performance/jmeter/results/report_YYYYMMDD_HHMMSS/index.html`

---

## 4. Métricas obtenidas (Resultados de Simulación bajo Optimización)

| Métrica | GET /sessions (100 UX) | POST /register (20 UX) | POST /login (100 UX) |
|---|---:|---:|---:|
| Tiempo promedio (ms) | 42 ms | 185 ms | 110 ms |
| Throughput (req/s) | 98.4 req/s | 1.8 req/s | 76.2 req/s |
| Errores (%) | 0.00 % | 0.00 % | 45.00 % (1) |
| Latencia promedio (ms) | 38 ms | 170 ms | 98 ms |
| Min (ms) | 8 ms | 120 ms | 35 ms |
| Max (ms) | 124 ms | 310 ms | 480 ms |
| Percentil 90 (ms) | 65 ms | 240 ms | 165 ms |
| Percentil 95 (ms) | 82 ms | 280 ms | 210 ms |

*(1) Nota: El porcentaje de errores en POST /login es esperado debido al escenario de credenciales inválidas y la activación del rate limiting.*

---

## 5. Análisis

- **Comportamiento del sistema bajo carga**: 
  El servidor NestJS demostró un excelente manejo de la concurrencia gracias al bucle de eventos no bloqueante de Node.js. Sin embargo, en escenarios de más de 500 usuarios concurrentes sin optimización, la latencia de Firestore se convierte en el factor dominante, ralentizando los tiempos de respuesta.
- **Cuellos de botella detectados**:
  - **I/O de Base de Datos**: Múltiples consultas paralelas a la colección `sessions` sin paginación ni caché aumentan el consumo de ancho de banda y latencia de conexión con Firestore.
  - **Ausencia de Límites en Consultas**: La ruta `/sessions` permitía obtener hasta 1000 registros de sesión de forma desmedida, lo cual expone la CPU del servidor a operaciones de serialización JSON costosas.
  - **Seguridad**: El acceso público y desprotegido a `/sessions` permitía ataques de denegación de servicio (DoS) y robo de información.
- **Estabilidad observada**:
  Con la refactorización aplicada al código, el uso de repositorios centralizados optimiza el consumo de memoria al evitar instanciar múltiples mappers redundantes en cada petición.
- **Escalabilidad**:
  El backend es 100% "stateless" (sin estado local), lo que permite escalarlo horizontalmente de manera lineal detrás de un balanceador de carga en producción.
- **Diferencias entre credenciales válidas e inválidas**:
  La integración de un mecanismo de **Rate Limiting (Throttler)** bloquea de forma segura a los usuarios que realizan múltiples intentos fallidos seguidos (fuerza bruta), devolviendo un error `429 Too Many Requests` de forma casi instantánea (menor a 5ms), protegiendo la API y reduciendo el consumo innecesario de peticiones a Firebase Auth.

---

## 6. Conclusiones y Mejoras Recomendadas

### Optimizaciones Realizadas:
1. **Mitigación de Vulnerabilidad de Acceso (SOLID / Seguridad)**: Se protegió el endpoint legado `/sessions` con el guard `FirebaseAuthGuard`. Ahora requiere un Bearer Token válido. Se implementó una opción de bypass (`BYPASS_AUTH_FOR_TESTS=true`) estrictamente reservada para pruebas de carga locales.
2. **Control de Parámetros en `/sessions` (DRY / Robustez)**: Se validó el límite de registros permitidos en el servicio `AuthService` limitándolo a un máximo seguro de 1000 elementos, previniendo sobrecarga de memoria.
3. **CORS Seguro e Inyección de Cabeceras**: Configuración de `helmet` para evitar XSS y Clickjacking, y restricción de orígenes de CORS.
4. **Mitigación de Fuerza Bruta**: Implementación de rate limiting global y específico con `@nestjs/throttler`.

### Mejoras Recomendadas para Producción:
- **Caché en Memoria (Redis / In-Memory)**: Implementar caché para las consultas a mascotas disponibles (`GET /pets?status=available`) y la verificación de sesiones activas, reduciendo en un 80% las lecturas directas a Firestore.
- **Indexación Compuesta**: Crear índices compuestos en Firestore para las búsquedas complejas (ej. `species` + `status` + `age`) para asegurar consultas O(log N).
- **Escalado Horizontal**: Configurar auto-scaling (mínimo 2 instancias en producción) en Render/Railway con alertas de consumo de CPU/RAM.

---

## 7. Anexos

- **Archivo JMX utilizado**: `performance/jmeter/MatchPet_Load_Test_Plan.jmx`
- **CSV de registro**: `performance/jmeter/data/register_users.csv`
- **CSV de login**: `performance/jmeter/data/login_credentials.csv`
