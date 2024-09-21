const express = require('express');
const router = express.Router();
const pool = require('../../db');

// Example CRUD routes for divisions
router.get('/', getAllDivisions);
router.get('/:id', getDivisionById);
router.post('/', createDivision);
router.get('/assets/:id', getAssetsByDivision);
// router.put('/:id', updateDivision);
// router.patch('/:id', partiallyUpdateDivision);
// router.delete('/:id', deleteDivision);

// Functions handling route logic
async function getAllDivisions(req, res) {
    try {
        const result = await pool.query('SELECT * FROM divisions');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching divisions', err);
        res.status(500).send('Internal Server Error');
    }
}

async function getDivisionById(req, res) {
    try {
        const divisionId = req.params.id;
        const query = 'SELECT * FROM divisions where id = $1';
        const { rows } = await pool.query(query, [divisionId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Division not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching division', err);
        res.status(500).send('Internal Server Error');
    }
}

async function createDivision(req, res) {
    try {
        const division = req.body;
        const query = `INSERT INTO divisions (label,
            description)
        VALUES ('${division.label}',
            '${division.description}')`;
        const result = await pool.query(query);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Division not created.' });
        } else {
            return res.status(200).json({ message: 'Division created successfully.'});
        }
    } catch (err) {
        console.error('Error creating division: ', err);
        res.status(500).send('Internal Server Error');
    }
}

async function getAssetsByDivision(req, res) {
    try {
        const divisionId = req.params.id;
        const query = 'SELECT * FROM assets where division_id = $1';
        const { rows } = await pool.query(query, [divisionId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Assets in division not found' });
        }
        res.json(rows);
    } catch (err) {
        console.error('Error fetching assets by division', err);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = router;