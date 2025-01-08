import crypto from "crypto";

export const hashPassword = (
  password: string
): { hash: string; salt: string } => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return { hash, salt };
};

export const verifyPassword = (
  password: string,
  hash: string,
  salt: string
): boolean => {
  const verifyHash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return hash === verifyHash;
};
