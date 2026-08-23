const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

async function runSetup() {
  console.log('\n==================================================');
  console.log('         Kairo — Interactive Product Setup        ');
  console.log('==================================================\n');

  // Step 1: Environment Detection
  console.log('Step 1 — Checking Environment...');
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10);
  
  // Read target version from .nvmrc if available
  let targetNodeVersion = '20.14.0';
  const nvmrcPath = path.join(process.cwd(), '.nvmrc');
  if (fs.existsSync(nvmrcPath)) {
    targetNodeVersion = fs.readFileSync(nvmrcPath, 'utf-8').trim();
  }

  if (majorVersion < 18) {
    console.error(`\n❌ Unsupported Node.js version: ${nodeVersion}`);
    console.error(`Kairo requires Node.js >= 18.0.0 (Recommended: ${targetNodeVersion}).`);
    console.error('Please upgrade your Node.js installation and run "npm run setup" again.\n');
    process.exit(1);
  }

  console.log(`✓ OS: ${process.platform} (${process.arch})`);
  console.log(`✓ Node.js Runtime: ${nodeVersion} (Compatible with target ${targetNodeVersion})`);

  // Step 2: Install Dependencies
  console.log('\nStep 2 — Verifying & Installing Node Dependencies...');
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  try {
    if (!fs.existsSync(nodeModulesPath)) {
      console.log('Running "npm install"...');
      execSync('npm install', { stdio: 'inherit' });
      console.log('✓ Dependencies installed successfully.');
    } else {
      console.log('✓ Dependencies already installed in node_modules.');
    }
  } catch (error) {
    console.error('\n❌ Dependency installation failed.');
    console.error('Actionable Fix: Ensure you have network access and C++ compilation tools installed.');
    console.error('Then run "npm install" manually.\n');
    process.exit(1);
  }

  // Step 3: Create .env.local safely
  console.log('\nStep 3 — Configuring Environment (.env.local)...');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), '.env.example');

  let envVars = {};

  if (!fs.existsSync(envLocalPath)) {
    console.log('Creating .env.local from template...');
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envLocalPath);
    } else {
      fs.writeFileSync(envLocalPath, 'BRIGHT_DATA_API_TOKEN=\nBRIGHT_DATA_COLLECTOR_ID=\nOPENAI_API_KEY=\n');
    }
    console.log('✓ Created .env.local template.');
  } else {
    console.log('✓ Existing .env.local found (Preserving your existing configuration).');
  }

  // Parse current .env.local
  const envLines = fs.readFileSync(envLocalPath, 'utf-8').split('\n');
  envLines.forEach(line => {
    const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)\s*$/);
    if (match) {
      envVars[match[1]] = match[2].trim();
    }
  });

  // Step 4: Interactive Credential Prompt if missing
  const missingKeys = [];
  if (!envVars.BRIGHT_DATA_API_TOKEN) missingKeys.push('BRIGHT_DATA_API_TOKEN');
  if (!envVars.BRIGHT_DATA_COLLECTOR_ID) missingKeys.push('BRIGHT_DATA_COLLECTOR_ID');
  if (!envVars.OPENAI_API_KEY) missingKeys.push('OPENAI_API_KEY');

  if (missingKeys.length > 0) {
    console.log('\n--------------------------------------------------');
    console.log('  Kairo Interactive Credential Setup');
    console.log('--------------------------------------------------');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

    if (!envVars.BRIGHT_DATA_API_TOKEN) {
      console.log('\n📌 Bright Data API Token:');
      console.log('   Required to authenticate geographic scraping requests.');
      console.log('   Get this from: Bright Data Dashboard -> Account Settings -> API Tokens');
      const token = await askQuestion('   BRIGHT_DATA_API_TOKEN: > ');
      if (token.trim()) envVars.BRIGHT_DATA_API_TOKEN = token.trim();
    }

    if (!envVars.BRIGHT_DATA_COLLECTOR_ID) {
      console.log('\n📌 Bright Data Collector ID:');
      console.log('   The ID of your Web Scraper Studio collector (usually starts with c_...)');
      console.log('   Get this from: Bright Data -> Scrapers -> Collector Header');
      const collector = await askQuestion('   BRIGHT_DATA_COLLECTOR_ID: > ');
      if (collector.trim()) envVars.BRIGHT_DATA_COLLECTOR_ID = collector.trim();
    }

    if (!envVars.OPENAI_API_KEY) {
      console.log('\n📌 OpenAI API Key:');
      console.log('   Required for AI sentiment scoring and narrative summary generation.');
      console.log('   Get this from: https://platform.openai.com/api-keys');
      const key = await askQuestion('   OPENAI_API_KEY: > ');
      if (key.trim()) envVars.OPENAI_API_KEY = key.trim();
    }

    rl.close();

    // Write updated keys back to .env.local without destroying comments or formatting
    let newEnvContent = '';
    const keysHandled = new Set();

    envLines.forEach(line => {
      const match = line.match(/^\s*([\w_]+)\s*=/);
      if (match && envVars[match[1]] !== undefined) {
        newEnvContent += `${match[1]}=${envVars[match[1]]}\n`;
        keysHandled.add(match[1]);
      } else {
        newEnvContent += line + '\n';
      }
    });

    // Append any keys that weren't in the original template
    Object.keys(envVars).forEach(key => {
      if (!keysHandled.has(key)) {
        newEnvContent += `${key}=${envVars[key]}\n`;
      }
    });

    fs.writeFileSync(envLocalPath, newEnvContent.trim() + '\n');
    console.log('\n✓ Updated .env.local with provided API credentials.');
  } else {
    console.log('✓ All required environment credentials are already present in .env.local.');
  }

  // Step 5: Automatically Run Diagnostics Doctor
  console.log('\nStep 5 — Running System Doctor Diagnostics...');
  try {
    require(path.join(process.cwd(), 'scripts', 'doctor.js'));
  } catch (err) {
    console.error('Doctor diagnostics execution warning:', err.message);
  }
}

runSetup();
