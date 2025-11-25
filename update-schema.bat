@echo off
echo Updating database schema...
echo.
echo This will:
echo 1. Stop the dev server (if running)
echo 2. Update the database with CopySettings table
echo 3. Restart the dev server
echo.
pause

echo Pushing schema changes...
npx prisma db push --accept-data-loss --skip-generate

echo.
echo Generating Prisma Client...
npx prisma generate

echo.
echo Done! Now restart your dev server with: npm run dev
echo.
pause

