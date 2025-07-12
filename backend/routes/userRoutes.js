const express = require('express');
const { firebaseAuth } = require('../middleware/firebaseAuth');
const { roleCheck } = require('../middleware/roleCheck');
const { User } = require('../models');

const router = express.Router();
const admin = require('../firebaseAdmin');

// GET /users/byFirebaseUid/:firebaseUid
router.get('/byFirebaseUid/:firebaseUid', async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const user = await User.findOne({
      where: { firebase_uid: firebaseUid },
      attributes: ['id', 'email', 'role'],
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/users/    
router.get('/', firebaseAuth, roleCheck(['admin']), async (req, res, next) => {
  try {
    const users = await User.findAll({ attributes: ['id','email','role','created_at'] });
    res.json(users);
  } catch (err) { next(err); }
});

// POST /api/users/       
router.post('/', firebaseAuth, roleCheck(['admin']), async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password, and role are required' });
  }
  try {
    //Create user in Firebase
    const userRecord = await admin.auth().createUser({ email, password });
    //Create record in our DB
    const newUser = await User.create({
      firebase_uid: userRecord.uid,
      email: userRecord.email,
      role
    });
    res.status(201).json({ id: newUser.id, email: newUser.email, role: newUser.role });
  } catch (err) {
    next(err);
  }
});

//PATCH /api/users/:id/password
router.patch(
  '/:id/password',
  firebaseAuth,
  roleCheck(['admin']), 
  async (req, res, next) => {
    try {
      const userId   = Number(req.params.id);
      const { newPassword } = req.body;
      if (!newPassword) {
        return res.status(400).json({ message: 'New password is required' });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await admin.auth().updateUser(user.firebase_uid, {
        password: newPassword
      });

      return res.json({ message: 'Password updated successfully' });
    } catch (err) {
      console.error('Error resetting password for user', err);
      if (err.code && err.code.startsWith('auth/')) {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  }
);

// PATCH /api/users/:id
router.patch(
  '/:id',
  firebaseAuth,
  roleCheck(['admin']), 
  async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      const { email, role } = req.body;
      if (email !== undefined) user.email = email;
      if (role !== undefined) user.role = role;

      await user.save();

      return res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      });
    } catch (err) {
      next(err);
    }
  }
);


// DELETE /api/users/:id  
router.delete('/:id', firebaseAuth, roleCheck(['admin']), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    //also delete from Firebase
    await admin.auth().deleteUser(user.firebase_uid);
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
});

module.exports = router;

//GET /api/users/:id
router.get(
  '/:id',
  firebaseAuth,
  roleCheck(['admin']),
  async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: ['id', 'email', 'role', 'created_at'],
      });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
);

