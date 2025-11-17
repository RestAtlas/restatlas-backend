require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { Pool } = require('pg');
const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// health
app.get('/health', (req,res)=> res.json({ok:true}));

// GET /v1/stops?lat=&lng=&radius_km=&filters=showers,truck_parking
app.get('/v1/stops', async (req,res)=>{
  try{
    const { lat, lng, radius_km=50 } = req.query;
    if(!lat || !lng){
      // fallback sample
      const q = 'SELECT id, name, address, lat, lng, facilities, fuel_diesel, fuel_regular, overnight, bathroom_rating FROM stops LIMIT 100';
      const r = await pool.query(q);
      return res.json({stops: r.rows});
    }
    const rkm = parseFloat(radius_km) || 50;
    const latMin = parseFloat(lat) - (rkm/111);
    const latMax = parseFloat(lat) + (rkm/111);
    const lngMin = parseFloat(lng) - (rkm/111);
    const lngMax = parseFloat(lng) + (rkm/111);
    let q = `SELECT id, name, address, lat, lng, facilities, fuel_diesel, fuel_regular, overnight, bathroom_rating
             FROM stops
             WHERE lat BETWEEN $1 AND $2 AND lng BETWEEN $3 AND $4
             LIMIT 200`;
    const vals = [latMin, latMax, lngMin, lngMax];
    const r = await pool.query(q, vals);
    res.json({stops: r.rows});
  } catch(e){
    console.error(e);
    res.status(500).json({error:'server error'});
  }
});

app.get('/v1/stops/:id', async (req,res)=>{
  try{
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM stops WHERE id=$1', [id]);
    if(rows.length===0) return res.status(404).json({error:'not found'});
    res.json(rows[0]);
  }catch(e){
    console.error(e);
    res.status(500).json({error:'server error'});
  }
});

// anonymous report (multipart optional)
app.post('/v1/reports/anon', upload.single('photo'), async (req,res)=>{
  try{
    const { lat,lng,bathroom_clean,parking_status,shower_available,overnight_allowed,stop_id } = req.body;
    const photo_url = req.file ? req.file.path : null;
    const q = `INSERT INTO reports (stop_id, lat, lng, bathroom_clean, parking_status, shower_available, overnight_allowed, photo_url)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`;
    const vals = [stop_id || null, lat || null, lng || null, bathroom_clean || null, parking_status || null, shower_available || null, overnight_allowed || null, photo_url];
    const r = await pool.query(q, vals);
    res.json({status:'ok', id: r.rows[0].id});
  }catch(e){
    console.error(e);
    res.status(500).json({error:'server error'});
  }
});

const port = process.env.PORT || 4000;
app.listen(port, ()=> console.log('RestAtlas API listening on', port));
