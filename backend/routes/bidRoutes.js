const express = require('express');
const { firebaseAuth } = require('../middleware/firebaseAuth');
const { roleCheck } = require('../middleware/roleCheck');
const { Bid, Offer, Deal, Transporter } = require('../models');
const { getSuggestedPrice } = require('../services/pricePrediction');
const { Op } = require('sequelize'); 

const router = express.Router();

// GET /api/bids/
router.get('/', firebaseAuth, async (req, res, next) => {
  try {
    const bids = await Bid.findAll({ order: [['created_at', 'DESC']] });
    res.json(bids);
  } catch (err) {
    next(err);
  }
});

// POST /api/bids/
router.post('/', firebaseAuth, roleCheck(['admin','staff']), async(req, res, next)=>{
  try {
    const {
      material_type,
      quantity_tons,
      pickup_location,
      delivery_location,
      deadline,
      transporter_requirements,
      distance_km,
    } = req.body;

    if (distance_km === undefined || distance_km <= 0) {
      return res.status(400).json({ message: 'Distance (km) is required and must be > 0' });
    }

    const basePrice = await getSuggestedPrice(
      quantity_tons,
      pickup_location,
      delivery_location,
      distance_km
    );

    const newBid = await Bid.create({
      material_type,
      quantity_tons,
      pickup_location,
      delivery_location,
      deadline,
      transporter_requirements,
      distance_km,
      base_price_rupee_per_km_per_ton: basePrice,
      created_by: req.user.id,
    });

    res.status(201).json(newBid);
  } catch (err) {
    next(err);
  }
});

// GET /api/bids/:id
router.get('/:id', firebaseAuth, async (req, res, next) => {
  try {
    const bid = await Bid.findByPk(req.params.id, {
      include: [
        { model: Offer, include: [Transporter] },
        { model: Deal },
      ],
    });
    if (!bid) return res.status(404).json({ message: 'Bid not found' });
    res.json(bid);
  } catch (err) {
    next(err);
  }
});

// POST /api/bids/:id/accept-off
router.post('/:id/accept-offer', firebaseAuth, roleCheck(['admin', 'staff']), async (req, res, next) => {
  try {
    const bid = await Bid.findByPk(req.params.id);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });
    if (bid.status !== 'open') {
      return res.status(400).json({ message: 'Bid is not open' });
    }

    const { offerId } = req.body;
    const offer = await Offer.findByPk(offerId);
    if (!offer || offer.bid_id !== bid.id) {
      return res.status(400).json({ message: 'Invalid offer' });
    }

    offer.status = 'accepted';
    await offer.save();

    await Offer.update(
    { status: 'closed' },
      {
        where: {
            bid_id: bid.id,
            id: {
            [Op.ne]: offer.id, // Exclude the offer that was just accepted
          },
        },
      }
    );

    bid.status = 'accepted';
    await bid.save();

    const transporter = await Transporter.findByPk(offer.transporter_id);
    await Deal.create({
      bid_id: bid.id,
      transporter_id: transporter.id,
      distance_km: bid.distance_km,
      deal_amount: offer.offered_price,
      material_type: bid.material_type,
      quantity_tons: bid.quantity_tons,
      pickup_location: bid.pickup_location,
      delivery_location: bid.delivery_location,
      created_by: req.user.id,
    });

    res.json({ message: 'Offer accepted and deal logged' });
  } catch (err) {
    next(err);
  }
});

// POST /api/bids/:id/close
router.post('/:id/close', firebaseAuth, roleCheck(['admin', 'staff']), async (req, res, next) => {
  try {
    const bid = await Bid.findByPk(req.params.id);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });
    if (bid.status !== 'open') return res.status(400).json({ message: 'Bid is not open' });
    bid.status = 'closed';
    await bid.save();
    res.json({ message: 'Bid closed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
