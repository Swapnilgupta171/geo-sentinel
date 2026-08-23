const fs = require('fs');
const path = require('path');

function runDoctor() {
  console.log('\n==================================================');
  console.log('         Kairo (GeoSentinel) System Doctor        ');
  console.log('==================================================\n');

  let issueCount = 0;

  // 1. Node.js Version Check
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10);
  if (majorVersion >= 18) {
    console.log(`✓ Node.js Runtime: ${nodeVersion} (Supported)`);
  } else {
    console.log(`❌ Node.js Runtime: ${nodeVersion} (Unsupported - Node >= 18 required, Node 20.14.0 recommended)`);
    issueCount++;
  }

  // 2. Dependency Check (node_modules)
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    console.log('✓ Node Modules: Installed');
  } else {
    console.log('❌ Node Modules: Missing (Run "npm install" first)');
    issueCount++;
  }

  // 3. Environment File Check (.env.local)
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), '.env.example');

  let envVars = {};
  if (fs.existsSync(envLocalPath)) {
    console.log('✓ Environment File: .env.local exists');
    const envContent = fs.readFileSync(envLocalPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)\s*$/);
      if (match) {
        envVars[match[1]] = match[2].trim();
      }
    });
  } else {
    console.log('⚠️ Environment File: .env.local missing (Created template from .env.example)');
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envLocalPath);
    } else {
      fs.writeFileSync(envLocalPath, 'BRIGHT_DATA_API_TOKEN=\nBRIGHT_DATA_COLLECTOR_ID=\nOPENAI_API_KEY=\n');
    }
  }

  // 4. Validate Environment Variables (without exposing values)
  const bdToken = envVars.BRIGHT_DATA_API_TOKEN || process.env.BRIGHT_DATA_API_TOKEN;
  const bdCollector = envVars.BRIGHT_DATA_COLLECTOR_ID || process.env.BRIGHT_DATA_COLLECTOR_ID;
  const openaiKey = envVars.OPENAI_API_KEY || process.env.OPENAI_API_KEY;

  if (bdToken && bdToken.length > 5) {
    console.log('✓ Bright Data API Token: Configured');
  } else {
    console.log('⚠️ Bright Data API Token: Missing in .env.local (BRIGHT_DATA_API_TOKEN)');
  }

  if (bdCollector && bdCollector.length > 2) {
    console.log('✓ Bright Data Collector ID: Configured');
  } else {
    console.log('⚠️ Bright Data Collector ID: Missing in .env.local (BRIGHT_DATA_COLLECTOR_ID)');
  }

  if (openaiKey && openaiKey.length > 5) {
    console.log('✓ OpenAI API Key: Configured');
  } else {
    console.log('⚠️ OpenAI API Key: Missing in .env.local (OPENAI_API_KEY)');
  }

  // 5. Database Connection Check (SQLite)
  try {
    const Database = require('better-sqlite3');
    const dbPath = path.join(process.cwd(), 'geo-sentinel.db');
    const db = new Database(dbPath);
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table';").all();
    console.log(`✓ SQLite Database: Connected (Tables: ${tables.map(t => t.name).join(', ') || 'None (Created on startup)'})`);
    db.close();
  } catch (e) {
    console.log(`⚠️ SQLite Database Warning: ${e.message.split('\n')[0]}`);
  }

  console.log('\n--------------------------------------------------');
  if (issueCount === 0) {
    console.log('✓ System Doctor Status: READY TO RUN ("npm run dev")');
  } else {
    console.log(`⚠️ System Doctor Status: ${issueCount} critical issues detected. Please fix before launching.`);
  }
  console.log('--------------------------------------------------\n');
}

runDoctor();
