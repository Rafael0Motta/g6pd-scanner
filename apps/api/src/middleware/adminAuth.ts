import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../lib/env";

export interface AdminTokenPayload {
  adminId: string;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AdminTokenPayload;
    }
  }
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "12h" });
}

/** Protege as rotas do painel admin oculto. Unico mecanismo de autenticacao do sistema. */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ error: "Token de admin ausente." });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AdminTokenPayload;
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Token de admin invalido ou expirado." });
  }
}
