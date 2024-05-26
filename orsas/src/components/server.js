const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); 
const jwt = require('jsonwebtoken');
const moment = require('moment');


const app = express();

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'orsas',
  password: 'postgres',
  port: 5432, 
});

app.use(express.json());

// Configure CORS
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
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
  


function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasLength = password.length >= 8;

    return hasUpperCase && hasLowerCase && hasNumber && hasLength;
}

// Endpoint za registraciju korisnika   
app.post('/api/register', async (req, res) => {
    const { korisnikime, korisnikemail, korisniksifra, korisnikprezime, organization} = req.body;

    // Validate email format
    if (!validateEmail(korisnikemail)) {
        return res.status(409).json({ message: 'Invalid email format' });
    }

    // Validate password format
    if (!validatePassword(korisniksifra)) {
        return res.status(409).json({ message: 'Invalid password format' });
    }

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


// Endpoint za dodavanje sastanaka
app.post('/api/event', authenticateToken, async (req, res) => {
    const { title, description, dateofevent, timeofevent, room, people } = req.body;
    const username = req.user.korisnikime;
    console.log(req.user)
    const datetime = moment(`${dateofevent} ${timeofevent}`).format('YYYY-MM-DD HH:mm:ss');
    
    try {
        const client = await pool.connect();

        // Retrieve the user's ID
        const userResult = await client.query(`SELECT korisnikid, kalendarid FROM korisnik WHERE korisnikime = $1`, [username]);
        const korisnikId = userResult.rows[0].korisnikid;
        const kalendarId = userResult.rows[0].kalendarid;

        // Retrieve or insert the room
        let roomId;
        const roomResult = await client.query(`SELECT * FROM soba WHERE sobanaziv = $1`, [room]);
        if (roomResult.rows.length > 0) {
            roomId = roomResult.rows[0].sobaid;
        } else {
            const lastRoom = await client.query(`SELECT * FROM soba ORDER BY sobaid DESC LIMIT 1`);
            if (lastRoom.rows.length > 0){
                const lastRoomId = lastRoom.rows[0].sobaid;
                roomId = lastRoomId + 1;
            } else {
                roomId = 1;
            }

            // roomId = lastRoomId.rows[0].nextId;
            await client.query(`INSERT INTO soba (sobaid, sobanaziv) VALUES ($1, $2)`, [roomId, room]);
        }

        // Insert the meeting (sastanak)
        // prvo ide provjera jel u to vrijeme postoji sastanak koji organizira isti korisnik
        const existingMeetingResult = await client.query(
            `SELECT * FROM sastanak WHERE datumvrijeme = $1 AND korisnikid = $2`,
            [datetime, korisnikId]
        );

        let sastanakId;
        if (existingMeetingResult.rows.length > 0) {
            return res.status(409).json({ message: 'Sastanak already exists' });
        } else {
            const lastMeetingRecord = await client.query(`SELECT * FROM sastanak ORDER BY sastanakid DESC LIMIT 1`);
            if(lastMeetingRecord.rows.length > 0){
                const lastMeetingId = lastMeetingRecord.rows[0].sastanakid;
                const nextMeetingId = lastMeetingId + 1;
                sastanakId = nextMeetingId;
            } else{
                sastanakId = 1;
            }

            await client.query(
                `INSERT INTO sastanak (sastanakid, datumvrijeme, korisnikid, sobaid, naslov, opis) VALUES ($1, $2, $3, $4, $5, $6)`,
                [sastanakId, datetime, korisnikId, roomId, title, description]
            );

            // Insert into kalendar-sastanak relationship
            await client.query(`INSERT INTO sastojiseod (kalendarid, sastanakid) VALUES ($1, $2)`, [kalendarId, sastanakId]);
        }
        

        // Insert attendees (uzvanik)
        const peopleList = people.split(',').map(person => person.trim());
        if (peopleList[0] !== '') {
            for (const person of peopleList) {
                // stavi ogradu da ako person nije korisnik, da ga se nemre dodat
                // ogranicenje da prvo ide ime pa prezime te moramo imat samo 1 ime i samo 1 prezime
                console.log(person)
                const personIme = person.split(' ')[0];
                const personPrezime = person.split(' ')[1];
                const attendeeResult = await client.query(`SELECT * FROM korisnik WHERE korisnikime = $1 AND korisnikprezime = $2`, [personIme, personPrezime]);
                if (attendeeResult.rows.length > 0) {
                    const korisnikId = attendeeResult.rows[0].korisnikid;
    
                    let uzvanikId;
                    const lastUzvanikRecord = await client.query(`SELECT * FROM uzvanik ORDER BY uzvanikid DESC LIMIT 1`);
                    if(lastUzvanikRecord.rows.length > 0){
                        const lastUzvanikId = lastUzvanikRecord.rows[0].uzvanikid;
                        const nextUzvanikId = lastUzvanikId + 1;
                        uzvanikId = nextUzvanikId;
                    } else {
                        uzvanikId = 1;
                    }
    
                    await client.query(`INSERT INTO uzvanik (uzvanikid, korisnikid) VALUES ($1, $2)`, [uzvanikId, korisnikId]);
                    await client.query(`INSERT INTO sadrži (sastanakid, uzvanikid) VALUES ($1, $2)`, [sastanakId, uzvanikId]);    

                } else {
                    client.release();
                    return res.status(401).json({ message: 'Uzvanik is not korisnik' });
                }
            }
        }
        
        // kreiraj obavijest
        let obavijestId;
            const lastObavijestRecord = await client.query(`SELECT * FROM obavijest ORDER BY obavijestid DESC LIMIT 1`);
            if(lastObavijestRecord.rows.length > 0){
                const lastObavijestId = lastObavijestRecord.rows[0].obavijestid;
                const nextObavijestId = lastObavijestId + 1;
                obavijestId = nextObavijestId;
            } else {
                obavijestId = 1;
            }
        await client.query(`INSERT INTO obavijest (obavijestid, sastanakid) VALUES ($1, $2)`, [obavijestId, sastanakId]);
        
        await client.query(`INSERT INTO prima (obavijestid, korisnikid) VALUES ($1, $2)`, [obavijestId, korisnikId]);

        client.release();
        res.status(200).json({ message: 'Event added successfully' });
    } catch (error) {
        console.error('Error adding event:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Fetch notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
    try {
        const korisnikIme = req.user.korisnikime; 
        const korisnikIdResult = await pool.query(
            `SELECT * FROM korisnik WHERE korisnikime = $1`,
            [korisnikIme]
        );
        const korisnikId = korisnikIdResult.rows[0].korisnikid;
        const result = await pool.query(
            `SELECT 
            s.opis,
            s.naslov,
            s.datumVrijeme as dateofevent,
            TO_CHAR(s.datumVrijeme, 'HH24:MI') as timeofevent,
            o.obavijestId
            FROM korisnik k
            JOIN sastanak s ON k.korisnikId = s.korisnikId 
            LEFT JOIN obavijest o ON s.sastanakId = o.sastanakId 
            WHERE k.korisnikId = $1 AND o.obavijestId IS NOT NULL`,
                [korisnikId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a notification
app.delete('/api/notifications/:eventId', authenticateToken, async (req, res) => {
    try {
        const eventId = req.params.eventId; 
        const korisnikIme = req.user.korisnikime; 
        const korisnikIdResult = await pool.query(
            `SELECT * FROM korisnik WHERE korisnikime = $1`,
            [korisnikIme]
        );
        const korisnikId = korisnikIdResult.rows[0].korisnikid;
        
        // Verify the notification belongs to the user
        const verifyResult = await pool.query(
            `SELECT *
            FROM obavijest o
            JOIN prima p ON o.obavijestId = p.obavijestId
            WHERE o.obavijestId = $1 AND p.korisnikId = $2`,
            [eventId, korisnikId]
        );

        if (verifyResult.rows.length === 0) {
            return res.status(403).json({ message: 'You are not authorized to delete this notification' });
        }

        await pool.query('DELETE FROM prima WHERE obavijestid = $1 AND korisnikid = $2', [eventId, korisnikId]);
        await pool.query('DELETE FROM obavijest WHERE obavijestid = $1', [eventId]);

        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Fetch events
app.get('/api/events', authenticateToken, async (req, res) => {
    try {
        const korisnikIme = req.user.korisnikime; 
        const korisnikIdResult = await pool.query(
            `SELECT * FROM korisnik WHERE korisnikime = $1`,
            [korisnikIme]
        );
        const korisnikId = korisnikIdResult.rows[0].korisnikid;
        const result = await pool.query(
            `SELECT *
            FROM korisnik k
            JOIN sastanak s ON k.korisnikId = s.korisnikId 
            WHERE k.korisnikId = $1`,
                [korisnikId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
