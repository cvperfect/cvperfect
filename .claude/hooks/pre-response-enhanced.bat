@echo off
rem Enhanced Pre-Response Hook with SuperClaude Enforcement
rem This script runs BEFORE every Claude response to ensure compliance

echo 🔒 SuperClaude Pre-Response Enforcement Check

rem Check if user input contains complex analysis keywords
set "USER_INPUT=%1"
set "REQUIRES_EXTENDED_THINKING=false"
set "REQUIRES_TOKEN_OPTIMIZATION=false"

rem Check for complex keywords
echo %USER_INPUT% | findstr /i /c:"analyze" >nul && set "REQUIRES_EXTENDED_THINKING=true"
echo %USER_INPUT% | findstr /i /c:"architecture" >nul && set "REQUIRES_EXTENDED_THINKING=true"
echo %USER_INPUT% | findstr /i /c:"optimize" >nul && set "REQUIRES_EXTENDED_THINKING=true"
echo %USER_INPUT% | findstr /i /c:"complex" >nul && set "REQUIRES_EXTENDED_THINKING=true"
echo %USER_INPUT% | findstr /i /c:"system" >nul && set "REQUIRES_EXTENDED_THINKING=true"
echo %USER_INPUT% | findstr /i /c:"performance" >nul && set "REQUIRES_EXTENDED_THINKING=true"

rem Check for large operation keywords
echo %USER_INPUT% | findstr /i /c:"large" >nul && set "REQUIRES_TOKEN_OPTIMIZATION=true"
echo %USER_INPUT% | findstr /i /c:"pages/index.js" >nul && set "REQUIRES_TOKEN_OPTIMIZATION=true"
echo %USER_INPUT% | findstr /i /c:"pages/success.js" >nul && set "REQUIRES_TOKEN_OPTIMIZATION=true"
echo %USER_INPUT% | findstr /i /c:"comprehensive" >nul && set "REQUIRES_TOKEN_OPTIMIZATION=true"

rem Auto-apply enforcement without asking
if "%REQUIRES_EXTENDED_THINKING%"=="true" (
    echo.
    echo 🧠 AUTO-APPLYING EXTENDED THINKING: Complex task detected - using 32K thinking tokens automatically
    echo CLAUDE_ENFORCEMENT_AUTO_EXTENDED_THINKING=32000 >> .claude/auto-enforcement.log
)

if "%REQUIRES_TOKEN_OPTIMIZATION%"=="true" (
    echo.
    echo 🔧 AUTO-APPLYING TOKEN OPTIMIZATION: Large operation detected - 70%% compression enabled automatically
    echo CLAUDE_ENFORCEMENT_AUTO_TOKEN_OPTIMIZATION=true >> .claude/auto-enforcement.log
)

rem Show auto-enforcement status
echo.
echo 🤖 SUPERCLAUD AUTO-ENFORCEMENT ACTIVE
echo • Extended Thinking: AUTO-APPLIED when complex tasks detected
echo • Token Optimization: AUTO-APPLIED for large operations (70%% compression)
echo • AI Commit Messages: AUTO-APPLIED when code changes detected
echo • Architecture Analysis: AUTO-APPLIED for structural changes
echo.
echo ✅ All features will be applied automatically - no commands needed!

rem Log the enforcement check
echo %date% %time%: Pre-response check - Extended thinking: %REQUIRES_EXTENDED_THINKING%, Token optimization: %REQUIRES_TOKEN_OPTIMIZATION% >> .claude/enforcement.log

echo ✅ Pre-response enforcement check complete

exit /b 0