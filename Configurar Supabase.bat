@echo off
rem ==================================================
rem  KARATE PARA LOS ENANOS - CONFIGURAR SUPABASE
rem  Doble clic: pide la URL y la clave anon de Supabase, prueba la conexion
rem  y las guarda en js\supabase.js (herramientas\configurar-supabase.ps1).
rem  Para quitar la conexion: Configurar Supabase.bat -Borrar
rem ==================================================
title Configurar Supabase - Karate para los Enanos
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0herramientas\configurar-supabase.ps1" %*
echo.
pause
