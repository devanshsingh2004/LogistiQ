const admin = require('firebase-admin');
const { User } = require('../models'); // Sequelize model

/**
 * Verifies Firebase ID token from the Authorization header:
 *  - Expects header: "Authorization: Bearer <Firebase_ID_Token>"
 *  - If valid, loads/creates a user record in our DB with role.
 */
async function firebaseAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    // decodedToken.uid - Firebase UID. 
    // decodedToken.email - email.
    let user = await User.findOne({ where: { firebase_uid: decodedToken.uid } });
    if (!user) {
      return res.status(403).json({ message: 'User not authorized' });
    }
    req.user = {
      id: user.id,
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: user.role
    };
    next();
  } catch (err) {
    console.error('Error verifying Firebase ID token:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = { firebaseAuth };
