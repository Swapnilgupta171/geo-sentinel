# INSTALL.md — Kairo Installation Guide

This document provides step-by-step instructions for installing and running **Kairo — AI Brand Reputation Intelligence** across macOS, Linux, and Windows PowerShell.

---

## 1. System Requirements

Before installing Kairo, ensure your machine meets the following prerequisites:

| Requirement | Minimum Version | Recommended Version |
|---|---|---|
| **Node.js** | `>= 18.0.0` | `20.14.0` (specified in `.nvmrc`) |
| **npm** | `>= 9.0.0` | `>= 10.0.0` |
| **Git** | Any modern release | Latest stable |
| **Operating System** | macOS 12+, Ubuntu 20.04+, or Windows 10/11 | Latest |

---

## 2. Automated Installation (Recommended)

### macOS / Linux
Open your terminal, navigate to the repository, and run:
```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

### Windows PowerShell
Open PowerShell as an Administrator or current user, navigate to the repository, and run:
```powershell
.\scripts\install.ps1
```

The automated setup script will:
1. Validate your Node.js and npm versions.
2. Install all Node dependencies via `npm install`.
3. Create `.env.local` safely from `.env.example` (preserving existing secrets).
4. Run `npm run doctor` to verify environment readiness.

---

## 3. Manual Installation

If you prefer manual control over setup, follow these steps:

### Step 1: Clone the Repository
```bash
git clone https://github.com/Swapnilgupta171/geo-sentinel.git
cd geo-sentinel
```

### Step 2: Install Node Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Open `.env.local` in your editor and enter your credentials:
```env
BRIGHT_DATA_API_TOKEN=your_bright_data_api_token
BRIGHT_DATA_COLLECTOR_ID=c_1234567890abcdef
OPENAI_API_KEY=sk-proj-your_openai_key
```

### Step 4: Run System Verification
```bash
npm run doctor
```

### Step 5: Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Verification & Health Check

You can run the health check anytime to verify your configuration:
```bash
npm run doctor
```
If all checks pass, you are ready to start analyzing brand reputations!
