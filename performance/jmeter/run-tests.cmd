@echo off
setlocal

set JMETER_BIN=%~1
if "%JMETER_BIN%"=="" set JMETER_BIN=jmeter

set SERVER_NAME=%~2
if "%SERVER_NAME%"=="" set SERVER_NAME=localhost

set PORT=%~3
if "%PORT%"=="" set PORT=3000

set PROTOCOL=%~4
if "%PROTOCOL%"=="" set PROTOCOL=http

set BASE_DIR=%~dp0
set PLAN=%BASE_DIR%MatchPet_Load_Test_Plan.jmx
set RESULTS_DIR=%BASE_DIR%results

if not exist "%RESULTS_DIR%" mkdir "%RESULTS_DIR%"

for /f "tokens=1-4 delims=/:-. " %%a in ('echo %date% %time%') do set TS=%%d%%b%%c_%%e%%f%%g
set JTL=%RESULTS_DIR%\result_%TS%.jtl
set REPORT=%RESULTS_DIR%\report_%TS%

"%JMETER_BIN%" -n -t "%PLAN%" -l "%JTL%" -e -o "%REPORT%" -Jhost=%SERVER_NAME% -Jport=%PORT% -Jprotocol=%PROTOCOL%

echo Ejecucion finalizada
echo JTL: %JTL%
echo HTML Report: %REPORT%
