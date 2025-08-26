@echo off
REM CLAUDE PROTOCOL AUTO-ENFORCER - Windows CMD Version
REM Automatyczne wymuszanie wszystkich reguł z CLAUDE.md

setlocal enabledelayedexpansion
set "message=%*"
set "enhanced=%message%"

REM 🔧 AUTO-DETECTION PATTERNS
echo !message! | findstr /I /C:"implement" /C:"create" /C:"build" /C:"develop" /C:"setup" /C:"configure" >nul
if !errorlevel! equ 0 set "flags=!flags! CREATE_TODO_LIST USE_SUBAGENT"

echo !message! | findstr /I /C:"fix" /C:"bug" /C:"error" /C:"debug" /C:"problem" >nul
if !errorlevel! equ 0 set "flags=!flags! USE_DEBUG_AGENTS ANTI_HALLUCINATION_MODE COMPILE_FIRST"

echo !message! | findstr /I /C:"analyze" /C:"optimize" /C:"refactor" /C:"architecture" >nul
if !errorlevel! equ 0 set "flags=!flags! ULTRATHINK_MODE USE_SUBAGENT"

echo !message! | findstr /I /C:"payment" /C:"stripe" /C:"api" /C:"webhook" >nul
if !errorlevel! equ 0 set "flags=!flags! USE_CVPERFECT_AGENTS CHECK_SYSTEM_INVARIANTS"

echo !message! | findstr /I /C:"template" /C:"cv" /C:"resume" /C:"export" >nul
if !errorlevel! equ 0 set "flags=!flags! USE_CVPERFECT_AGENTS"

echo !message! | findstr /I /C:"test" /C:"testing" >nul
if !errorlevel! equ 0 set "flags=!flags! COMPILE_FIRST TEST_DRIVEN_DEVELOPMENT"

REM 🎯 SHORTCUT CONVERSION
set "enhanced=!enhanced:-sa= USE_SUBAGENT!"
set "enhanced=!enhanced:-th= THINK_MODE!"
set "enhanced=!enhanced:-tth= THINK_HARD_MODE!"
set "enhanced=!enhanced:-uth= ULTRATHINK_MODE!"
set "enhanced=!enhanced:-tdd= TEST_DRIVEN_DEVELOPMENT!"
set "enhanced=!enhanced:-cf= COMPILE_FIRST!"
set "enhanced=!enhanced:-vf= VERIFY_FULL_SEQUENCE!"
set "enhanced=!enhanced:-ag= USE_CVPERFECT_AGENTS!"
set "enhanced=!enhanced:-db= USE_DEBUG_AGENTS!"
set "enhanced=!enhanced:-td= CREATE_TODO_LIST!"
set "enhanced=!enhanced:-ah= ANTI_HALLUCINATION_MODE!"

REM 🚀 ADD PROTOCOL INSTRUCTIONS
if not "!flags!"=="" (
  echo !enhanced!
  echo.
  echo 🔒 PROTOCOL_ENFORCER ACTIVE: !flags!
  echo.
  echo MANDATORY_EXECUTION_RULES:
  
  echo !flags! | findstr /C:"CREATE_TODO_LIST" >nul
  if !errorlevel! equ 0 echo • MUST use TodoWrite tool for task tracking
  
  echo !flags! | findstr /C:"USE_SUBAGENT" >nul
  if !errorlevel! equ 0 echo • MUST use Task tool with specialized sub-agent
  
  echo !flags! | findstr /C:"USE_DEBUG_AGENTS" >nul  
  if !errorlevel! equ 0 echo • MUST use debug agents from start-debug-agents.js
  
  echo !flags! | findstr /C:"USE_CVPERFECT_AGENTS" >nul
  if !errorlevel! equ 0 echo • MUST use CVPerfect 40-agent system
  
  echo !flags! | findstr /C:"ULTRATHINK_MODE" >nul
  if !errorlevel! equ 0 echo • MUST use maximum analysis budget ^(ultrathink^)
  
  echo !flags! | findstr /C:"COMPILE_FIRST" >nul
  if !errorlevel! equ 0 echo • MUST run npm run build before any tests
  
  echo !flags! | findstr /C:"ANTI_HALLUCINATION_MODE" >nul
  if !errorlevel! equ 0 echo • MUST verify all claims and test fixes
  
  echo !flags! | findstr /C:"CHECK_SYSTEM_INVARIANTS" >nul
  if !errorlevel! equ 0 echo • MUST preserve: CV upload, payment, AI, templates, exports
  
  echo.
  echo VIOLATION_RESPONSE: If any rule is ignored, user will receive ERROR message.
) else (
  echo !enhanced!
)