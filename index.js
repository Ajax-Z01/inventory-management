const express = require('express');
const firebaseAdmin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const serviceAccount = require('./serviceAccountKey.json');
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: 'https://inventory-management-2ca9c-default-rtdb.asia-southeast1.firebasedatabase.app/'
});

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Inventory Management System API is running');
});

require('./routes')(app);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
