const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (!file.endsWith('.sql')) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    await pool.query(sql);
    console.log(`Migration applied: ${file}`);
  }
}

module.exports = runMigrations;
