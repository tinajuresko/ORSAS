const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); 
const jwt = require('jsonwebtoken');
const moment = require('moment');


const app = express();

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Orsas',
  password: 'bazepodataka',
  port: 5432, 
});

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true // Omogući slanje kolačića (cookies) s zahtjevima
}));

// Endpoint za prijavu korisnika
app.post('/api/login', async (req, res) => {
    const { korisnikime, korisniksifra } = req.body;
    try {
        const client = await pool.connect();
        const result = await client.query(
            `SELECT * FROM korisnik WHERE korisnikime = $1 AND korisniksifra = $2`,
            [korisnikime, korisniksifra]
        );
        console.log(korisnikime);
        client.release();
        if (result.rows.length > 0) {
            const token = jwt.sign({ korisnikime: korisnikime }, 'tajni-kljuc', { expiresIn: '15h' });
            console.log(token);
            res.status(200).json({ message: 'Logged in successfully' , token: token});
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (err) {
        console.error('Error during user login:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/login', (req, res) => {
    res.status(405).send('Method Not Allowed');
  });

const authenticateToken = require('./authenticateToken');

app.get('/api/protectedRoute', authenticateToken, (req, res) => {
      // Ruta koja zahtijeva autentifikaciju
      // Ovdje možete pristupiti req.user kako biste dobili informacije o trenutnom korisniku
      res.json({ message: 'Authenticated route', user: req.user });
});
  

// Endpoint za registraciju korisnika
app.post('/api/register', async (req, res) => {
    const { korisnikime, korisnikemail, korisniksifra, korisnikprezime, organization} = req.body;
    try {
        // Provjeri postoji li korisnik s istim korisničkim imenom
        const client = await pool.connect();
        const usernameCheck = await client.query(
            `SELECT * FROM korisnik WHERE korisnikime = $1 AND korisnikprezime = $2`,
            [korisnikime, korisnikprezime]
        );
        if (usernameCheck.rows.length > 0) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        const lastrecord = await pool.query(
            `SELECT * FROM korisnik ORDER BY korisnikid DESC LIMIT 1`
        );
        const lastrecordK = await pool.query(
            `SELECT * FROM kalendar ORDER BY kalendarid DESC LIMIT 1`
        );
        const lastrecordO = await pool.query(
            `SELECT * FROM organizacija ORDER BY orgid DESC LIMIT 1`
        );

        let korisnikid, orgid, kalendarid;

        if(lastrecord.rows.length > 0){
            const lastKorisnikid = lastrecord.rows[0].korisnikid;
            const nextKorisnikid = lastKorisnikid + 1;
            korisnikid = nextKorisnikid;
        }else{
            korisnikid = 1;
        }
        if(lastrecordK.rows.length > 0){
            const lastKalendarid = lastrecordK.rows[0].kalendarid;
            const nextKalendarid = lastKalendarid + 1;
            kalendarid = nextKalendarid;
        }else{
            kalendarid = 1;
        }

        if(lastrecordO.rows.length > 0){
            const lastOrgid = lastrecordO.rows[0].orgid;
            const nextOrgid = lastOrgid + 1;
            orgid = nextOrgid;
        }else{
            orgid = 1;
        }

        console.log(korisnikid);
        console.log(orgid);
        console.log(kalendarid);
        const organizationCheck = await client.query(
            `SELECT * FROM organizacija WHERE orgnaziv = $1`,
            [organization]
        );
        if(organizationCheck.rows.length > 0){
            orgid = organizationCheck.rows[0].orgid; 
        }else{
            const resultOrg = await client.query(
                `INSERT INTO organizacija (orgid, orgnaziv) VALUES ($1, $2)`,
                [orgid, organization]
            );
            
        }
        

        const resultKalendar = await client.query(
            `INSERT INTO kalendar (kalendarid) VALUES ($1)`,
            [kalendarid]
        );
       
        // Unesi novog korisnika u bazu podataka
        const result = await client.query(
            `INSERT INTO korisnik (korisnikid, korisnikime, korisnikprezime, korisnikemail, korisniksifra, kalendarid, orgid) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [korisnikid, korisnikime, korisnikprezime, korisnikemail, korisniksifra, kalendarid, orgid]
        );
        client.release();
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Error during user registration:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Endpoint za dohvaćanje korisničkih podataka
app.get('/api/user/:username', authenticateToken, async (req, res) => {
    const username  = req.user.korisnikime;
    console.log(req.user);

    try {
        const client = await pool.connect();
        const result = await client.query(
            `SELECT * FROM korisnik WHERE korisnikime = $1`,
            [username]
        );
        client.release();

        if (result.rows.length > 0) {
            const userData = result.rows[0];
            res.json({ success: true, data: userData });
        } else {
            res.json({ success: false, error: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user data:', error.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Endpoint za dohvaćanje naziva organizacije
app.get('/api/organization/:orgId', async (req, res) => {
    const { orgId } = req.params;

    try {
        const client = await pool.connect();
        const result = await client.query(
            `SELECT orgnaziv FROM organizacija WHERE orgid = $1`,
            [orgId]
        );
        client.release();

        if (result.rows.length > 0) {
            const orgName = result.rows[0].orgnaziv;
            res.json({ success: true, data: { name: orgName } });
        } else {
            res.json({ success: false, error: 'Organization not found' });
        }
    } catch (error) {
        console.error('Error fetching organization name:', error.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.post('/api/edit', authenticateToken, async (req, res) => {
    try {
        const { organizacija, prezime, email } = req.body;
        const username = req.user.korisnikime;

        const client = await pool.connect();
        let orgId;

        const orgResult = await client.query(
            `SELECT * FROM organizacija WHERE orgnaziv = $1`,
            [organizacija]
        );

        if(orgResult.rows.length > 0){
            orgId = orgResult.rows[0].orgid;
        }else{
            const lastrecord = await pool.query(
                `SELECT * FROM korisnik ORDER BY korisnikid DESC LIMIT 1`
            );
            const lastOrgId= lastrecord.rows[0].orgid;
            const nextOrgId= lastOrgId + 1;
            orgId = nextOrgId;
            const insertOrgResult = await client.query(
                `INSERT INTO organizacija (orgId, orgnaziv) VALUES ($1, $2)`,
                [orgId, organizacija]
            );
        }
        
        // Provjeri postoji li korisnik s zadanim korisničkim imenom
        const result = await client.query(
            `SELECT * FROM korisnik WHERE korisnikime = $1`,
            [username]
        );

        // Ako korisnik postoji, ažuriraj njegove atribute
        if (result.rows.length > 0) {
            await client.query(
                `UPDATE korisnik SET orgid = $1, korisnikprezime = $2, korisnikemail = $3 WHERE korisnikime = $4`,
                [orgId, prezime, email, username]
            );
            client.release();
            res.status(200).json({ success: true, message: 'User data updated successfully' });
        } else {
            client.release();
            res.status(404).json({ success: false, error: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user data:', error.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
    


});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
