#!/usr/bin/env bash

# Kairo (GeoSentinel) Automated Installer for macOS / Linux
set -e

echo ""
echo "=================================================="
echo "          Kairo — AI Reputation Setup             "
echo "=================================================="
echo ""

# 1. Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (>= 20.14.0) and try again."
    exit 1
fi

NODE_VER=$(node -v)
echo "✓ Node.js detected: ${NODE_VER}"

# 2. Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

# 3. Install Dependencies
echo ""
echo "Installing dependencies via npm..."
npm install

# 4. Initialize .env.local safely
if [ ! -f .env.local ]; then
    echo ""
    echo "Creating .env.local from template..."
    if [ -f .env.example ]; then
        cp .env.example .env.local
    else
        echo "BRIGHT_DATA_API_TOKEN=" > .env.local
        echo "BRIGHT_DATA_COLLECTOR_ID=" >> .env.local
        echo "OPENAI_API_KEY=" >> .env.local
    fi
    echo "✓ Created .env.local"
else
    echo "✓ Existing .env.local preserved (will not overwrite secrets)"
fi

# 5. Run System Doctor
echo ""
node scripts/doctor.js

echo ""
echo "=================================================="
echo " Setup complete! Next steps:"
echo " 1. Edit .env.local to add your API credentials:"
echo "    - BRIGHT_DATA_API_TOKEN"
echo "    - BRIGHT_DATA_COLLECTOR_ID"
echo "    - OPENAI_API_KEY"
echo " 2. Launch local development server:"
echo "    npm run dev"
echo "=================================================="
echo ""
