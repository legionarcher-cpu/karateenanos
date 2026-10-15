@echo off
rem ==================================================
rem  KARATE PARA LOS ENANOS - LANZADOR
rem  Doble clic: enciende el mini servidor (herramientas\servidor.ps1) y abre la pagina.
rem  Deja abierta la ventana negra mientras la usan; para apagar, cerrarla.
rem ==================================================
title Karate para los Enanos
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0herramientas\servidor.ps1"
