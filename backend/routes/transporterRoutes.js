const express = require('express');
const { firebaseAuth } = require('../middleware/firebaseAuth');
const { roleCheck } = require('../middleware/roleCheck');
const { Transporter, Offer, Deal, Bid, User } = require('../models');

const router = express.Router();

// GET /api/transporters/
router.get('/', firebaseAuth, roleCheck(['admin','staff']), async (req, res, next) => {
  try {
    const transporters = await Transporter.findAll();
    res.json(transporters);
  } catch (err) { next(err); }
});

// GET /api/transporters/count
router.get(
  '/count',
  firebaseAuth,
  roleCheck(['admin','staff']),
  async (req, res, next) => {
    try {
      const totalTransporters = await Transporter.count();
      return res.json({ totalTransporters });
    } catch (err) {
      console.error('Error in GET /api/transporters/count:', err);
      next(err);
    }
  }
);

// POST /api/transporters/
router.post('/', firebaseAuth, roleCheck(['admin']), async (req, res, next) => {
  try {
    const { name, contact_number, vehicle_type, capacity_tons, status } = req.body;
    const newTransporter = await Transporter.create({
      name, contact_number, vehicle_type, capacity_tons, status
    });
    res.status(201).json(newTransporter);
  } catch (err) { next(err); }
});

// GET /api/transporters/:id
router.get('/:id', firebaseAuth, roleCheck(['admin']), async (req, res, next) => {
  try {
    const transporter = await Transporter.findByPk(req.params.id);
    if (!transporter) return res.status(404).json({ message: 'Not found' });
    res.json(transporter);
  } catch (err) { next(err); }
});

// PATCH /api/transporters/:id  
router.patch('/:id', firebaseAuth, roleCheck(['admin']), async (req, res, next) => {
  try {
    const transporter = await Transporter.findByPk(req.params.id);
    if (!transporter) return res.status(404).json({ message: 'Not found' });
    const { name, contact_number, vehicle_type, capacity_tons, status } = req.body;
    transporter.name = name ?? transporter.name;
    transporter.contact_number = contact_number ?? transporter.contact_number;
    transporter.vehicle_type = vehicle_type ?? transporter.vehicle_type;
    transporter.capacity_tons = capacity_tons ?? transporter.capacity_tons;
    transporter.status = status ?? transporter.status;
    await transporter.save();
    res.json(transporter);
  } catch (err) { next(err); }
});



//GET /api/transporters/:id/history
router.get(
  '/:id/history',
  firebaseAuth,
  roleCheck(['admin','staff']),
  async (req, res, next) => {
    try {
      const transporterId = parseInt(req.params.id, 10);
      const transporter = await Transporter.findByPk(transporterId);
      if (!transporter) {
        return res.status(404).json({ message: 'Transporter not found' });
      }

      const offers = await Offer.findAll({
        where: { transporter_id: transporterId },
        order: [['created_at', 'DESC']],
        include: [
          {
            model: Bid,
            attributes: ['id', 'material_type', 'quantity_tons', 'pickup_location', 'delivery_location', 'deadline']
          }
        ]
      });

      const deals = await Deal.findAll({
        where: { transporter_id: transporterId },
        order: [['deal_date', 'DESC']],
        include: [
          {
            model: Bid,
            attributes: ['id', 'material_type', 'quantity_tons', 'pickup_location', 'delivery_location', 'deadline']
          },
          {
            model: User,
            attributes: ['id', 'email']
          }
        ]
      });

      return res.json({ transporter: { id: transporter.id, name: transporter.name }, offers, deals });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/transporters/:id  
router.delete('/:id', firebaseAuth, roleCheck(['admin']), async (req, res, next) => {
  try {
    const transporter = await Transporter.findByPk(req.params.id);
    if (!transporter) return res.status(404).json({ message: 'Not found' });
    await transporter.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
