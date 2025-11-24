@echo off
echo Setting up SQLite database...
echo.

echo Creating .env file...
(
echo # Database - SQLite ^(no setup needed!^)
echo DATABASE_URL="file:./dev.db"
echo.
echo # Web3Modal Project ID - Get from https://cloud.walletconnect.com ^(optional for testing^)
echo NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=""
echo.
echo # Codex Blockchain ^(Pre-configured^)
echo NEXT_PUBLIC_CODEX_CHAIN_ID="1776"
echo NEXT_PUBLIC_CODEX_RPC_URL="http://node-mainnet.thecodex.net/"
echo NEXT_PUBLIC_CODEX_NATIVE_TOKEN="DEX"
echo.
echo # App Configuration
echo NEXT_PUBLIC_APP_NAME="Social Trading Platform"
echo NEXT_PUBLIC_APP_URL="http://localhost:3000"
) > .env

echo .env file created!
echo.
echo Pushing database schema...
call npm run prisma:push
echo.
echo Setup complete! Now run: npm run dev
pause

