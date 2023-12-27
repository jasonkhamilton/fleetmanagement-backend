const express = require('express');
const router = express.Router();
const pool = require('../../db');

// Example CRUD routes for assets
router.get('/', getAllServices);
// router.get('/:id', getReadingById);
router.get('/byAsset/:id', getServicesByAsset);
router.post('/', createService);
// router.put('/:id', updateReading);
// router.patch('/:id', partiallyUpdateReading);
// router.delete('/:id', deleteReading);

// Functions handling route logic
async function getAllServices(req, res) {
    try {
        const result = await pool.query('SELECT * FROM services');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching services', err);
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

async function getServicesByAsset(req, res) {
    try {
        const assetId = req.params.id;
        const query = 'SELECT * FROM asset_services where asset_id = $1';
        const { rows } = await pool.query(query, [assetId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json(rows);
    } catch (err) {
        console.error('Error fetching services', err);
        res.status(500).send('Internal Server Error');
    }
}

async function createService(req, res) {
    try {
        const service = req.body;
        const query = `INSERT INTO services (service_name,
            interval_type,
            interval_days)
        VALUES ('${service.serviceName}',
            '${service.intervalType}',
            '${service.intervalDays}')`;
        const result = await pool.query(query);
        console.log(result);
        if (result.rowCount <= 0) {
            return res.status(404).json({ message: 'Service not created' });
        }
        res.json(res.status(200));
    } catch (err) {
        console.error('Error creating service: ', err);
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
