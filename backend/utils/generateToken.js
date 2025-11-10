import jwt from 'jsonwebtoken';

// This function creates the token
// It uses the JWT_SECRET from your .env file
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // You can set this to '1h', '7d', etc.
  });
};

export default generateToken;