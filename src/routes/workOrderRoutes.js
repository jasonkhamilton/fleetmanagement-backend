const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const pool = require('../../db');

// Example CRUD routes for work orders
router.get('/', getAllWorkOrders);
router.get('/:id', getWorkOrderById);
router.get('/byAsset/:id', getWorkOrdersByAsset);
router.post('/', createWorkOrder);
// router.put('/:id', updateAsset);
// router.patch('/:id', partiallyUpdateAsset);
router.delete('/:id', deleteWorkOrder);

// // Image operations
// router.get('/image/:id', getAssetImage);
// router.post('/image/:id', upload.single('image'), uploadAssetImage);
// router.delete('/image/:id', deleteAssetImage);

async function getAllWorkOrders (req, res) {
    try {
        const query = 'SELECT * FROM work_orders';
        const { rows } = await pool.query(query);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Work orders not found'});
        }
        res.json(rows);
    } catch (err) {
        console.error('Error fetching work orders', err);
        res.status(500).send('Internal Server Error');
    }
}

async function getWorkOrderById (req, res) {
    try {
        const workOrderId = req.params.id;
        const query = 'SELECT * FROM work_orders WHERE work_order_id = $1';
        const { rows } = await pool.query(query, [workOrderId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Work order not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching work order', err);
        res.status(500).send('Internal Server Error');
    }
}

async function getWorkOrdersByAsset (req, res) {
    try {
        const assetId = req.params.id;
        const query = 'SELECT * FROM work_orders WHERE asset_id = $1';
        const { rows } = await pool.query(query, [assetId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Work order not found' });
        }
        res.json(rows);
    } catch (err) {
        console.error('Error fetching work order', err);
        res.status(500).send('Internal Server Error');
    }
}

async function createWorkOrder (req, res) {
    try {
        const workOrder = req.body;
        const query = `INSERT INTO work_orders (asset_id,
            description,
            time_in_hours,
            cost_parts,
            cost_labor,
            status)
        VALUES ('${workOrder.assetId}',
            '${workOrder.description}',
            '${workOrder.time}',
            '${workOrder.costParts}',
            '${workOrder.costLabour}',
            '${workOrder.isOpen}')`;
        const result = await pool.query(query);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Work order not created.' });
        } else {
            return res.status(200).json({ message: 'Work order created successfully.'});
        }
    } catch (err) {
        console.error('Error creating work order: ', err);
        res.status(500).send('Internal Server Error');
    }
}

async function deleteWorkOrder (req, res) {
    try {
        const query = `DELETE FROM work_orders WHERE id='$1'`;
        const result = await pool.query(query, [req.params.id]);
        // console.log(result);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Work order not deleted.' });
        } else {
            return res.status(200).json({ message: 'Work order deleted successfully.' });
        }
    } catch (err) {
        res.status(500).send('Internal Server Error');
    } 
}

module.exports = router;