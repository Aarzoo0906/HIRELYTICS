import { isAllowedAdminEmail } from "../config/adminUsers.js";

const adminMiddleware = (req, res, next) => {
  if (
    req.user?.role !== "admin" ||
    !isAllowedAdminEmail(req.user?.email || "")
  ) {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  next();
};

export default adminMiddleware;
