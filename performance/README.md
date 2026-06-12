# TP QA - Pruebas de Performance y Carga con JMeter

Este paquete deja el enunciado implementado en el proyecto MatchPet.

## Endpoints usados

- GET `/sessions`
- POST `/register`
- POST `/login`

Tambien quedan disponibles los endpoints nativos:

- POST `/auth/register`
- POST `/auth/login`

## Archivos incluidos

- `performance/jmeter/MatchPet_Load_Test_Plan.jmx` - Plan principal (GET /sessions habilitado)
- `performance/jmeter/MatchPet_Diagnostics.jmx` - Plan de diagnóstico simple para validar endpoints
- `performance/jmeter/data/register_users.csv`
- `performance/jmeter/data/login_credentials.csv`
- `performance/jmeter/run-tests.cmd`
- `performance/report-template.md`

## Preparacion

1. Levantar backend

```powershell
npm run start:dev
```

2. Verificar salud

- `GET http://localhost:3000/health`

3. Abrir JMeter y cargar el plan `.jmx`.

## Ejecucion de escenarios GET /sessions

Usar `MatchPet_Load_Test_Plan.jmx` que trae 5 Thread Groups:

- 10 usuarios (habilitado por defecto)
- 50 usuarios (deshabilitado)
- 100 usuarios (deshabilitado)
- 500 usuarios (deshabilitado)
- 1000 usuarios (deshabilitado)

**Recomendación**: Ejecutar uno por vez habilitando/deshabilitando Thread Groups en JMeter GUI.

### Pasos:
1. Abrir `MatchPet_Load_Test_Plan.jmx` en JMeter
2. Correr solo GET /sessions (10 usuarios) - esto da métricas sin error
3. Documentar: tiempo promedio, throughput, latencia, min/max, %ile 90 y 95
4. Repetir con 50, 100, 500 y 1000 usuarios

## Diagnostico de POST /register y POST /login

**Nota**: Si ves 100% de errores en POST, es probable que Firebase no esté configurado o haya problemas de validación.

### Plan 1: Diagnóstico simple

Usa `MatchPet_Diagnostics.jmx`:

```
- Test 1: GET /health (valida backend activo)
- Test 2: GET /sessions (valida endpoint legacy)  
- Test 3: POST /register con timestamp único
```

Ver respuestas en "View Results in Table" para identificar el error exacto.

### Plan 2: POST con CSV (cuando Firebase esté configurado)

En `MatchPet_Load_Test_Plan.jmx`:
- POST /register (Thread Group deshabilitado, habilitar cuando esté listo)
  - Usa `CSV Data Set Config` con `register_users.csv`
  - Acepta respuestas `200` (registro exitoso) o `400` (duplicado/validacion)

- POST /login (Thread Group deshabilitado, habilitar cuando esté listo)
  - Usa `login_credentials.csv` con casos validos e invalidos
  - Incluye intentos consecutivos para simular fuerza bruta

## Ejecucion por CLI (no GUI)

```bat
performance\jmeter\run-tests.cmd "C:\apache-jmeter-5.6.3\bin\jmeter.bat" localhost 3000 http
```

Salida:

- JTL en `performance/jmeter/results`
- Reporte HTML en `performance/jmeter/results/report_YYYYMMDD_HHMMSS`

## Metricas a reportar

Usar resultados de Aggregate Report en JMeter:

- Tiempo promedio de respuesta (ms)
- Throughput (req/s)
- Latencia (ms)
- Porcentaje de errores (%)
- Tiempo maximo (ms)
- Tiempo minimo (ms)
- Percentil 90 (ms)
- Percentil 95 (ms)

Completar `performance/report-template.md` con resultados de cada escenario.

## Troubleshooting

Si ves 100% Err tras ejecutar:

1. **Verifica backend está levantado**:
   ```
   curl http://localhost:3000/health
   ```

2. **Usa plan Diagnostics**:
   - Abre `MatchPet_Diagnostics.jmx`
   - Ejecuta test por test
   - Revisa "View Results in Table" para ver respuesta exacta

3. **Posibles causas**:
   - Firebase no configurado: Los endpoints POST fallan
   - Validación DTO estricta: Campos faltantes o formato incorrecto
   - Headers Content-Type: Asegurar `application/json`

4. **Solución**:
   - Para este TP, enfócate en GET /sessions (eso funciona sin Firebase)
   - POST requiere Firebase + variables de entorno correctas
