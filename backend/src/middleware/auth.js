const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.cookies?.token;

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = payload.userId;
      return next();
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  const guestToken = req.headers['x-guest-token'];
  if (guestToken) {
    req.guestToken = guestToken;
    return next();
  }

  return res.status(401).json({ error: 'Authentication required' });
}

module.exports = authMiddleware;
