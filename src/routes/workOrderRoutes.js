const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const pool = require('../../db');

const nodemailer = require('nodemailer');
// Configure the transporter (for Gmail)
const transporter = nodemailer.createTransport({
    host: 'mail.smtp2go.com',
    port: 587,
    auth: {
        user: process.env.SMTP_USER,    // Your email
        pass: process.env.SMTP_PASS      // Your email password (you may need to use an app-specific password)
    }
});

// Example CRUD routes for work orders
router.get('/', getAllWorkOrders);
router.get('/:id', getWorkOrderById);
router.get('/byAsset/:id', getWorkOrdersByAsset);
router.post('/', createWorkOrder);
// router.put('/:id', updateAsset);
// router.patch('/:id', partiallyUpdateAsset);
router.delete('/:id', deleteWorkOrder);

// Image operations
router.get('/image/:id', getWorkOrderImage);
router.post('/image/:id', upload.single('image'), uploadWorkOrderImage);
router.delete('/image/:id', deleteWorkOrderImage);

// Image functions
async function getWorkOrderImage (req, res) {
    try {
        const workOrderId = req.params.id;
        const query = 'SELECT * FROM work_order_images WHERE work_order_id = $1';
        const { rows } = await pool.query(query, [workOrderId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Work Order Image not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching work order image', err);
        res.status(500).send('Internal Server Error');
    }
}

async function uploadWorkOrderImage (req, res) {
    try {
        if (!req.file) {
            return res.status(400).send('No File Uploaded.');
        }

        const workOrderId = req.params.id;
        const imageBinary = req.file.buffer;
        // const short_description = ???

        const query = 'INSERT INTO work_order_images (work_order_id, image_data) VALUES ($1, $2)';
        await pool.query(query, [workOrderId, imageBinary]);

        return res.status(200).send('Image Uploaded Successfully.');
    } catch (err) {
        console.error('Error uploading work order image', err);
        res.status(500).send('Internal Server Error');
    }
}

async function deleteWorkOrderImage (req, res) {
    try {
        const query = `DELETE FROM work_order_images WHERE image_id = $1`;
        const result = await pool.query(query, [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Work order image not deleted.' });
        } else {
            return res.status(200).json({ message: 'Work order image deleted successfully.' });
        }
    } catch (err) {
        res.status(500).send('Internal Server Error');
    } 
}

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
            '${workOrder.isOpen}')
        RETURNING work_order_id`;
        const result = await pool.query(query);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Work order not created.' });
        } else {
            const mailOptions = {
                from: 'fleetmanagement-assistant@jhwebdesign.com.au',
                to: 'jason@jhwebdesign.com.au',  // You can use the customer's email or other relevant emails
                subject: `Work Order #${result.rows[0].work_order_id}`,
                text: `A new work order has been created for Asset #${workOrder.assetId}.\n\nDescription: ${workOrder.description}\nTime: ${workOrder.time} hours\nCost (Parts): ${workOrder.costParts}\nCost (Labor): ${workOrder.costLabour}`,
                html: `<h1>Work Order #${result.rows[0].work_order_id}</h1>
                        <p>A new work order has been created for Asset #${workOrder.assetId}.</p>
                        <p><strong>Description:</strong> ${workOrder.description}</p>
                        <p><strong>Time:</strong> ${workOrder.time} hours</p>
                        <p><strong>Cost (Parts):</strong> ${workOrder.costParts}</p>
                        <p><strong>Cost (Labor):</strong> ${workOrder.costLabour}</p>`
            };
            
            try {
                await transporter.sendMail(mailOptions);
                console.log('Email sent successfully');
            } catch (error) {
                console.error('Error sending email:', error);
            }
            return res.status(200).json({ message: `Work order #${result.rows[0].work_order_id} created successfully.`});
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