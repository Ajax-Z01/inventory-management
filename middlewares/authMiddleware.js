const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

// Middleware to authenticate user using Firebase Auth
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach the decoded token to the request object
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized', error: error.message });
  }
};

// Middleware to check user role
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const { role } = req.user;

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }

    next();
  };
};

module.exports = { authenticateUser, authorizeRoles };
