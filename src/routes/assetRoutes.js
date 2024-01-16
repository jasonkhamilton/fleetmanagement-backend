const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const pool = require('../../db');

// Example CRUD routes for assets
router.get('/', getAllAssets);
router.get('/:id', getAssetById);
router.post('/', createAsset);
router.put('/:id', updateAsset);
router.patch('/:id', partiallyUpdateAsset);
router.delete('/:id', deleteAsset);

// Image operations
router.get('/image/:id', getAssetImage);
router.post('/image/:id', upload.single('image'), uploadAssetImage);
router.delete('/image/:id', deleteAssetImage);

// Image functions
async function getAssetImage (req, res) {
    try {
        const assetId = req.params.id;
        const query = 'SELECT * FROM asset_images WHERE asset_id = $1';
        const { rows } = await pool.query(query, [assetId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Asset Image not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching asset image', err);
        res.status(500).send('Internal Server Error');
    }
}

async function uploadAssetImage (req, res) {
    try {
        if (!req.file) {
            return res.status(400).send('No File Uploaded.');
        }

        const assetId = req.params.id;
        const imageBinary = req.file.buffer;

        const query = 'INSERT INTO asset_images (asset_id, image_data) VALUES ($1, $2)';
        await pool.query(query, [assetId, imageBinary]);

        return res.status(200).send('Image Uploaded Successfully.');
    } catch (err) {
        console.error('Error uploading asset image', err);
        res.status(500).send('Internal Server Error');
    }
}

async function deleteAssetImage (req, res) {

}

// Functions handling route logic
async function getAllAssets(req, res) {
    try {
        const result = await pool.query('SELECT * FROM assets');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching assets', err);
        res.status(500).send('Internal Server Error');
    }
}

async function getAssetById(req, res) {
    try {
        const assetId = req.params.id;
        const query = 'SELECT * FROM assets where id = $1';
        const { rows } = await pool.query(query, [assetId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Asset not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching asset', err);
        res.status(500).send('Internal Server Error');
    }
}

async function createAsset(req, res) {
    try {
        const asset = req.body;
        const query = `INSERT INTO assets (reference,
            registration_number,
            make,
            model,
            year,
            type)
        VALUES ('${asset.reference}',
            '${asset.registrationNumber}',
            '${asset.make}',
            '${asset.model}',
            '${asset.year}',
            '${asset.type}')`;
        const result = await pool.query(query);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Asset not created.' });
        } else {
            return res.status(200).json({ message: 'Asset created successfully.'});
        }
    } catch (err) {
        console.error('Error creating asset: ', err);
        res.status(500).send('Internal Server Error');
    }
}

function updateAsset(req, res) { /* Logic to update a specific asset */ }
function partiallyUpdateAsset(req, res) { /* Logic to partially update an asset */ }

async function deleteAsset(req, res) {
    try {

    } catch (err) {
        
    } 
}

module.exports = router;
