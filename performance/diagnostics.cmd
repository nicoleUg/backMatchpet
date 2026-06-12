@echo off
REM Diagnostico de endpoints MatchPet

setlocal enabledelayedexpansion

set HOST=%1
if "!HOST!"=="" set HOST=http://localhost:3000

echo.
echo === MATCHPET API DIAGNOSTICS ===
echo.
echo Testing: %HOST%
echo.

echo 1. Testing GET /health
powershell -Command "try { $response = Invoke-WebRequest -Uri '%HOST%/health' -Method GET -UseBasicParsing; Write-Host $response.Content; Write-Host 'Status:' $response.StatusCode } catch { Write-Host $_.Exception.Message -ForegroundColor Red }"
echo.

echo 2. Testing GET /sessions
powershell -Command "try { $response = Invoke-WebRequest -Uri '%HOST%/sessions' -Method GET -UseBasicParsing; Write-Host $response.Content; Write-Host 'Status:' $response.StatusCode } catch { Write-Host $_.Exception.Message -ForegroundColor Red }"
echo.

echo 3. Testing POST /register with test data
powershell -Command "try { $body = @{ username='testuser_'+(Get-Date -UFormat '%%s'); email='test_'+(Get-Date -UFormat '%%s')+'@test.com'; password='Pass123456' } | ConvertTo-Json; $response = Invoke-WebRequest -Uri '%HOST%/register' -Method POST -Headers @{'Content-Type'='application/json'} -Body $body -UseBasicParsing; Write-Host $response.Content; Write-Host 'Status:' $response.StatusCode } catch { Write-Host $_.Exception.Response.StatusCode; Write-Host $_.Exception.Response.Content.ReadAsStringAsync().Result } "
echo.

echo 4. Testing POST /login with test data
powershell -Command "try { $body = @{ username='juan_carlos'; password='Password123' } | ConvertTo-Json; $response = Invoke-WebRequest -Uri '%HOST%/login' -Method POST -Headers @{'Content-Type'='application/json'} -Body $body -UseBasicParsing; Write-Host $response.Content; Write-Host 'Status:' $response.StatusCode } catch { Write-Host $_.Exception.Response.StatusCode; Write-Host $_.Exception.Response.Content.ReadAsStringAsync().Result }"
echo.

echo === END DIAGNOSTICS ===
echo.
