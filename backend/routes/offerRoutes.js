const express = require('express');
const { firebaseAuth } = require('../middleware/firebaseAuth');
const { roleCheck } = require('../middleware/roleCheck');
const { Offer, Bid, Transporter } = require('../models');

const router = express.Router();

// GET /api/offers/
router.get('/', firebaseAuth, roleCheck(['admin', 'staff']), async (req, res, next) => {
  try {
    const offers = await Offer.findAll({ include: [Bid, Transporter] });
    res.json(offers);
  } catch (err) {
    next(err);
  }
});


// POST /api/offers/
router.post('/', firebaseAuth, roleCheck(['admin', 'staff']), async (req, res, next) => {
  try {
    const { bid_id, transporter_id, offered_price_per_km_per_ton, remarks } = req.body;

    //Validate the bid
    const bid = await Bid.findByPk(bid_id);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });
    if (bid.status !== 'open') return res.status(400).json({ message: 'Cannot offer on a closed/accepted bid' });

    //Validate transporter
    const transporter = await Transporter.findByPk(transporter_id);
    if (!transporter) return res.status(404).json({ message: 'Transporter not found' });

    //Check per‐km per‐ton price >= base
    const basePrice = parseFloat(bid.base_price_rupee_per_km_per_ton);
    if (parseFloat(offered_price_per_km_per_ton) < basePrice) {
      return res.status(400).json({
        message: `Offered price per km per ton (₹${offered_price_per_km_per_ton}) cannot be less than the base ₹ ${basePrice.toFixed(2)}`
      });
    }

    //Compute total offered_price = distance_km * offered_price_per_km_per_ton * quantity_tons
    const totalOffered = parseFloat(bid.distance_km) *
                         parseFloat(offered_price_per_km_per_ton) *
                         parseFloat(bid.quantity_tons);

    const newOffer = await Offer.create({
      bid_id,
      transporter_id,
      offered_price_per_km_per_ton,
      offered_price: totalOffered.toFixed(2), 
      remarks: remarks || null,
    });

    res.status(201).json(newOffer);
  } catch (err) {
    next(err);
  }
});

// GET /api/offers/:id
router.get('/:id', firebaseAuth, roleCheck(['admin', 'staff']), async (req, res, next) => {
  try {
    const offer = await Offer.findByPk(req.params.id, {
      include: [Bid, Transporter],
    });
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.json(offer);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/offers/:id
router.delete('/:id', firebaseAuth, roleCheck(['admin', 'staff']), async (req, res, next) => {
  try {
    const offer = await Offer.findByPk(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    await offer.destroy();
    res.json({ message: 'Offer deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
