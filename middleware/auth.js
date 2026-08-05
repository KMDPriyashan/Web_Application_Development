const jwt = require('jsonwebtoken');

// SECURITY DEBT: Hardcoded - will be fixed in Week 7
const SECRET_KEY = 'hict32022-super-secret';

function verifyToken(req, res, next) {
  // Get the Authorization header
  const authHeader = req.headers['authorization'];

  // No token provided
  if (!authHeader) {
    return res.status(401).json({
      message: 'No token provided. Please log in.'
    });
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;  // Attach user data to request
    next();              // Continue to the route handler
  } catch (error) {
    return res.status(403).json({
      message: 'Invalid or expired token.'
    });
  }
}

module.exports = { verifyToken, SECRET_KEY };