# Informe Tecnico de Performance - MatchPet

## 1. Introduccion

- Objetivo de las pruebas:
- Alcance funcional:
- Descripcion del entorno:
  - SO:
  - CPU/RAM:
  - Version Node/Nest:
  - Version JMeter:
  - URL base:

## 2. Configuracion de pruebas

### 2.1 Escenarios GET /sessions

| Escenario | Usuarios | Ramp-Up | Loops | Endpoint |
|---|---:|---:|---:|---|
| 1 | 10 | 20s | 5 | /sessions |
| 2 | 50 | 20s | 5 | /sessions |
| 3 | 100 | 20s | 5 | /sessions |
| 4 | 500 | 60s | 5 | /sessions |
| 5 | 1000 | 90s | 5 | /sessions |

### 2.2 Escenario POST /register

| Usuarios | Ramp-Up | Loops | Origen de datos |
|---:|---:|---:|---|
| 20 | 10s | 1 | CSV Data Set Config |

### 2.3 Escenario POST /login

| Tipo | Usuarios | Ramp-Up | Loops | Endpoint |
|---|---:|---:|---:|---|
| Login mixto (validos e invalidos) | 100 | 25s | 20 | /login |
| Fuerza bruta | Incluido en CSV | N/A | N/A | /login |

## 3. Evidencias

- Captura de Test Plan JMeter:
- Captura de Summary Report:
- Captura de Aggregate Report:
- Captura de grafico de tiempos:
- Link o ruta al reporte HTML:

## 4. Metricas obtenidas

| Metrica | GET /sessions | POST /register | POST /login |
|---|---:|---:|---:|
| Tiempo promedio (ms) |  |  |  |
| Throughput (req/s) |  |  |  |
| Errores (%) |  |  |  |
| Latencia promedio (ms) |  |  |  |
| Min (ms) |  |  |  |
| Max (ms) |  |  |  |
| Percentil 90 (ms) |  |  |  |
| Percentil 95 (ms) |  |  |  |

## 5. Analisis

- Comportamiento del sistema bajo carga:
- Cuellos de botella detectados:
- Estabilidad observada:
- Escalabilidad:
- Diferencias entre credenciales validas e invalidas:

## 6. Conclusiones

- Cuantas sesiones concurrentes soporta la aplicacion:
- Que sucede bajo alta concurrencia:
- Como responde ante intentos invalidos:
- Mejoras recomendadas:
  - Optimizacion de consultas
  - Politicas de rate limiting
  - Caché
  - Escalado horizontal
  - Monitoreo APM

## 7. Anexos

- Archivo JMX utilizado: `performance/jmeter/MatchPet_Load_Test_Plan.jmx`
- CSV de registro: `performance/jmeter/data/register_users.csv`
- CSV de login: `performance/jmeter/data/login_credentials.csv`
