function authorizeRoles(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userRole = req.user.role;

    const isAllowed = Array.isArray(allowedRoles)
      ? allowedRoles.includes(userRole)
      : userRole === allowedRoles;

    if (isAllowed) {
      return next();
    }

    return res
      .status(403)
      .json({ success: false, message: "Forbidden: Insufficient permission" });
  };
}

module.exports = authorizeRoles;
