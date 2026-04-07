export const DEFAULT_ADMIN_PASSWORD = "1234";

export const ALLOWED_ADMIN_USERS = [
  {
    name: "Aditya Kanaujiya",
    email: "adityakanaujiya81@gmail.com",
  },
  {
    name: "Aarzoo Singh",
    email: "aarzoosingh0906@gmail.com",
  },
];

export const normalizeEmail = (email = "") => email.trim().toLowerCase();

export const isAllowedAdminEmail = (email = "") =>
  ALLOWED_ADMIN_USERS.some(
    (admin) => normalizeEmail(admin.email) === normalizeEmail(email),
  );
