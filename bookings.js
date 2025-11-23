const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/authMiddleware');
const QRCode = require('qrcode');

// Create Booking
router.post('/', authenticate, (req, res) => {
    const { resource_id, start_time, end_time } = req.body;

    // Check double-booking
    db.query(
        "SELECT * FROM bookings WHERE resource_id=? AND status='approved' AND ((start_time<=? AND end_time>=?) OR (start_time<=? AND end_time>=?))",
        [resource_id, start_time, start_time, end_time, end_time],
        (err, result) => {
            if (err) return res.status(500).send(err);
            if (result.length) return res.status(400).send({ message: 'Resource already booked for this time' });

            db.query(
                "INSERT INTO bookings (user_id, resource_id, start_time, end_time) VALUES (?,?,?,?)",
                [req.user.id, resource_id, start_time, end_time],
                (err, result) => {
                    if (err) return res.status(500).send(err);
                    res.send({ message: 'Booking request sent' });
                }
            );
        }
    );
});

// Get user bookings
router.get('/my', authenticate, (req, res) => {
    db.query(
        "SELECT b.*, r.name as resource_name FROM bookings b JOIN resources r ON b.resource_id=r.id WHERE b.user_id=?",
        [req.user.id],
        (err, result) => {
            if (err) return res.status(500).send(err);
            res.send(result);
        }
    );
});

// Admin: Approve/Reject Booking
router.post('/action', authenticate, (req, res) => {
   
    const { booking_id, action } = req.body;

    if (!['approved', 'rejected'].includes(action))
        return res.status(400).send({ message: 'Invalid action' });

    db.query("UPDATE bookings SET status=? WHERE id=?", [action, booking_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Action performed' });
    });
});

// QR Code for approved bookings
router.get('/qrcode/:booking_id', authenticate, async (req, res) => {
    const booking_id = req.params.booking_id;
    db.query("SELECT * FROM bookings WHERE id=?", [booking_id], async (err, result) => {
        if (err) return res.status(500).send(err);
        if (!result.length) return res.status(404).send({ message: 'Not found' });
        const qr = await QRCode.toDataURL(`Booking: ${booking_id}`);
        res.send({ qr });
    });
});

module.exports = router;//booking.js