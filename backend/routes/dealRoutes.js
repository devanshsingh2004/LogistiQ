
const express = require('express');
const { firebaseAuth } = require('../middleware/firebaseAuth');
const { roleCheck } = require('../middleware/roleCheck');
const { Bid, Offer, Deal, Transporter, User } = require('../models');

const router = express.Router();


// GET /api/deals/ 
router.get(
  '/',
  firebaseAuth,
  roleCheck(['admin','staff']),
  async (req, res, next) => {
    try {
      const deals = await Deal.findAll({
        order: [['created_at', 'DESC']],
        include: [
          {
            model: Bid,
            attributes: ['id', 'material_type', 'quantity_tons'],
          },
          {
            model: Transporter,
            attributes: ['id', 'name'],
          },
          {
            model: User,
            attributes: ['id', 'email'],
          },
        ],
      });
      res.json(deals);
    } catch (err) {
      next(err);
    }
  }
);


// POST /api/deals/add 
// Log a manual deal
router.post(
  '/add',
  firebaseAuth,
  roleCheck(['admin', 'staff']),
  async (req, res, next) => {
    try {
      const {
        bid_id,
        transporter_id,
        deal_amount,
        material_type,
        distance_km,
        quantity_tons,
        pickup_location,
        delivery_location,
        deal_date,
      } = req.body;

      
      const transporter = await Transporter.findByPk(transporter_id);
      if (!transporter) {
        return res.status(404).json({ message: 'Transporter not found' });
      }

      const newDeal = await Deal.create({
        bid_id: bid_id || null,
        transporter_id,
        deal_amount,
        material_type,
        distance_km,
        quantity_tons,
        pickup_location,
        delivery_location,
        deal_date: deal_date || new Date(),
        created_by: req.user.id,
      });

      //Close that bid + all of its offers
      if (bid_id) {
        // Mark the bid itself as closed
        await Bid.update(
          { status: 'closed' },
          { where: { id: bid_id } }
        );

        //Mark all offers attached to that bid as closed
        await Offer.update(
          { status: 'closed' },
          { where: { bid_id: bid_id } }
        );
      }

      const dealWithAssociations = await Deal.findByPk(newDeal.id, {
        include: [
          {
            model: Bid,
            attributes: ['id', 'material_type', 'quantity_tons', 'distance_km', 'status'],
          },
          { model: Transporter, attributes: ['id', 'name'] },
          { model: User, attributes: ['id', 'email'] },
        ],
      });

      return res.status(201).json(dealWithAssociations);
    } catch (err) {
      next(err);
    }
  }
);
module.exports = router;
