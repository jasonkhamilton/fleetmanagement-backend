const express = require('express');
const router = express.Router();
const pool = require('../../db');

// Example CRUD routes for assets
router.get('/', getAllReadings);
router.get('/:id', getReadingById);
router.get('/byAsset/:id', getReadingByAsset);
router.post('/', createReading);
router.put('/:id', updateReading);
router.patch('/:id', partiallyUpdateReading);
router.delete('/:id', deleteReading);

// Functions handling route logic
async function getAllReadings(req, res) {
    try {
        const result = await pool.query('SELECT * FROM readings');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching readings', err);
        res.status(500).send('Internal Server Error');
    }
}

async function getReadingById(req, res) {
    try {
        const readingId = req.params.id;
        const query = 'SELECT * FROM readings where id = $1';
        const { rows } = await pool.query(query, [readingId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Reading not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching reading', err);
        res.status(500).send('Internal Server Error');
    }
}

async function getReadingByAsset(req, res) {
    try {
        const assetId = req.params.id;
        const query = 'SELECT * FROM readings where asset_id = $1';
        const { rows } = await pool.query(query, [assetId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Reading not found' });
        }
        res.json(rows);
    } catch (err) {
        console.error('Error fetching reading', err);
        res.status(500).send('Internal Server Error');
    }
}

async function createReading(req, res) {
    try {
        const reading = req.body;
        const query = `INSERT INTO readings (asset_id,
            measurement_type,
            measurement)
        VALUES ('${reading.asset_id}',
            '${reading.type}',
            '${reading.measurement}')`;
        const result = await pool.query(query);
        if (result.rowCount <= 0) {
            return res.status(404).json({ message: 'Reading not created' });
        }
        res.status(200).json({ message: 'Reading created.' });
    } catch (err) {
        console.error('Error creating reading: ', err);
        res.status(500).send('Internal Server Error');
    }
}

function updateReading(req, res) { /* Logic to update a specific asset */ }
function partiallyUpdateReading(req, res) { /* Logic to partially update an asset */ }

async function deleteReading(req, res) {
    try {

    } catch (err) {
        
    } 
}

module.exports = router;
