@echo off
echo Running auth.api.test.js...
call npm test -- --testPathPattern=auth.api.test.js --watchAll=false
echo.
echo Running utils.test.js...
call npm test -- --testPathPattern=utils.test.js --watchAll=false
echo.
echo Running App.test.js...
call npm test -- --testPathPattern=App.test.js --watchAll=false
echo.
echo Running Navigation.test.js...
call npm test -- --testPathPattern=Navigation.test.js --watchAll=false
echo.
echo Running auth.context.test.js...
call npm test -- --testPathPattern=auth.context.test.js --watchAll=false
echo.
echo All tests completed successfully! 