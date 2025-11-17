require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function importCSV(path) {
  const raw = fs.readFileSync(path, 'utf8').trim();
  const lines = raw.split('\n').slice(1).filter(Boolean);
  for(const line of lines){
    const cols = line.split(',');
    const name = cols[1] ? cols[1].replace(/\"/g,'') : 'Unnamed';
    const address = cols[2] ? cols[2].replace(/\"/g,'') : '';
    const lat = parseFloat(cols[3]) || 0;
    const lng = parseFloat(cols[4]) || 0;
    const facilities = cols[5] ? cols[5].replace(/\"/g,'').split('|') : [];
    const diesel = parseFloat(cols[6]) || null;
    const regular = parseFloat(cols[7]) || null;
    const overnight = cols[8] && cols[8].toUpperCase().trim() === 'TRUE';
    const rating = parseFloat(cols[9]) || null;
    await pool.query(
      'INSERT INTO stops (name,address,lat,lng,facilities,fuel_diesel,fuel_regular,overnight,bathroom_rating) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [name,address,lat,lng,facilities,diesel,regular,overnight,rating]
    );
  }
  console.log('Import complete');
  process.exit(0);
}

const csvPath = process.env.CSV_PATH || './roadmate_seed_stops_expanded.csv';
importCSV(csvPath).catch(e=>{console.error(e); process.exit(1);});
