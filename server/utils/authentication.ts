import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "jwt-secret-change-in-production";

// HELPERS
export function generateToken(payload: {id: string, email: string, role: string}) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}