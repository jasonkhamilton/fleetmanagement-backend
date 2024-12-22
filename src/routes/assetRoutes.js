const express = require('express');
const router = express.Router();
const multer = require('multer');
const csvParser = require('csv-parser');
const { Readable } = require('stream');
const fs = require('fs');
const upload = multer();
const pool = require('../../db');

// Example CRUD routes for assets
router.get('/', getAllAssets);
router.get('/:id', getAssetById);
router.post('/', createAsset);
router.put('/:id', updateAsset);
router.patch('/:id', partiallyUpdateAsset);
router.delete('/deleteall', deleteAllAssets);
// router.delete('/:id', deleteAsset);

// file upload operations
router.post('/upload', upload.single('csvFile'), uploadAssetsFromFile);

// Image operations
router.get('/image/:id', getAssetImage);
router.post('/image/:id', upload.single('image'), uploadAssetImage);
router.delete('/image/:id', deleteAssetImage);

// Upload Assets from CSV
async function uploadAssetsFromFile (req, res) {
    try {
        if (!req.file) {
            return res.status(400).send('No File Uploaded.');
        }
        
        const fileStream = new Readable();
        fileStream.push(req.file.buffer);
        fileStream.push(null);

        let insertQuery = `INSERT INTO assets (reference,
            registration_number,
            make,
            model,
            year,
            type,
            serial_number) VALUES `;

        fileStream.pipe(csvParser())
            .on('data', (row) => {
                const valueString = `('${ row['Fleet #'] }', '${ row['REGO'] }', '${ row['Make'] }', '${ row['Model'].replace("'", '') }', 2000, 'Unkown', NULL),`;
                insertQuery += valueString;
            })
            .on('end', async () => {
                // Remove last ',' and end query with ';'
                insertQuery = insertQuery.slice(0, -1);
                insertQuery += ';';

                console.log(insertQuery);

                try {
                    const result = await pool.query(insertQuery);
                    if (result.rowCount === 0) {
                        return res.status(404).json({ message: 'Assets not created.' });
                    } else {
                        return res.status(200).json({ message: 'Assets created successfully.'});
                    }
                } catch (error) {
                    console.error('Error creating assets: ', error);
                    res.status(500).send('Internal Server Error');
                }
            });
    } catch (err) {
        console.error('Error uploading CSV: ', err);
    }
}

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
            type,
            serial_number)
        VALUES ('${asset.reference}',
            '${asset.registrationNumber}',
            '${asset.make}',
            '${asset.model}',
            '${asset.year}',
            '${asset.type}',
            '${asset.serial}') RETURNING id`;
        const result = await pool.query(query);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Asset not created.' });
        } else {
            return res.status(200).json({ message: 'Asset created successfully.', id: result.rows[0].id});
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
        const query = `DELETE FROM assets WHERE id='${req.params.id}'`;
        const result = await pool.query(query);
        // console.log(result);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Asset not deleted.' });
        } else {
            return res.status(200).json({ message: 'Asset deleted successfully.' });
        }
    } catch (err) {
        res.status(500).send('Internal Server Error');
    } 
}

async function deleteAllAssets(req, res) {
    try {
        const query = `DELETE FROM asset_images WHERE asset_id IN (SELECT id FROM assets); DELETE FROM assets`;
        const result = await pool.query(query);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Assets not deleted.' });
        } else {
            return res.status(200).json({ message: 'Assets deleted successfully.' });
        }
    } catch (err) {
        res.status(500).send('Internal Server Error');
    } 
}

module.exports = router;
