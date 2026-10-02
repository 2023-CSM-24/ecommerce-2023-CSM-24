function requireAdmin(req, res, next) {
  const adminToken = process.env.ADMIN_TOKEN;
  const providedToken = req.headers.authorization;

  if (!adminToken) {
    return res.status(500).json({
      error: "ADMIN_TOKEN is not configured"
    });
  }

  if (providedToken !== `Bearer ${adminToken}`) {
    return res.status(401).json({
      error: "Unauthorized"
    });
  }

  next();
}

module.exports = requireAdmin;
