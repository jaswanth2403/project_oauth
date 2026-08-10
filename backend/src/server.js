const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const googleAuthRouter = require('./auth/google');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(express.json());


// Test endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'OAuth/OIDC backend is running'
  });
});


// Google OAuth/OIDC routes
app.use('/auth', googleAuthRouter);


app.listen(3000, () => {
  console.log('Backend running on http://localhost:3000');
});