import bcrypt from "bcrypt";
import User from "../models/User.js";
import {
  ALLOWED_ADMIN_USERS,
  DEFAULT_ADMIN_PASSWORD,
  normalizeEmail,
} from "../config/adminUsers.js";

export const ensureAdminUsers = async () => {
  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

  await Promise.all(
    ALLOWED_ADMIN_USERS.map(async (adminUser) => {
      const normalizedEmail = normalizeEmail(adminUser.email);
      const existingUser = await User.findOne({ email: normalizedEmail });

      if (!existingUser) {
        await User.create({
          name: adminUser.name,
          email: normalizedEmail,
          password: hashedPassword,
          role: "admin",
          mustChangePassword: true,
          passwordChangedAt: null,
        });
        return;
      }

      existingUser.name = adminUser.name;
      existingUser.email = normalizedEmail;
      existingUser.role = "admin";

      if (!existingUser.passwordChangedAt) {
        existingUser.password = hashedPassword;
        existingUser.mustChangePassword = true;
      }

      await existingUser.save();
    }),
  );
};
