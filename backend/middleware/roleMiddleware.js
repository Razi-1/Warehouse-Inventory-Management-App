// GITHUB: Day 2 - Commit 2 - "feat(backend): add User model, auth controllers, routes, and JWT middleware"

// Usage: router.post('/', protect, authorize('admin'), createWarehouse)
// Accepts one or more allowed roles as arguments
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to perform this action`,
      });
    }
    next();
  };
};

module.exports = { authorize };
