function requireAdmin(req, res, next) {
  if (req.auth.role !== "admin") {
    return res.status(403).json({ message: "Admin required" });
  }

  next();
}

module.exports = requireAdmin;
