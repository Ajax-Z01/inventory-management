const admin = require('firebase-admin');

// Register a new user
const registerUser = async (req, res) => {
  const { email, password, displayName, role } = req.body;

  if (!email || !password || !displayName || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    // Set custom claims (role)
    await admin.auth().setCustomUserClaims(userRecord.uid, { role });

    // Optionally store user in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      displayName,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: 'User registered successfully', uid: userRecord.uid });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = req.user; // Decoded token from authenticateUser middleware
    res.json({
      uid: user.uid,
      email: user.email,
      role: user.role, // Role stored in custom claims
      name: user.name || '',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  getUserProfile,
};
