import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { DEVICE_ID_HEADER } from "@g6pd/shared-types";
import type { Device } from "@prisma/client";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      device?: Device;
    }
  }
}

const DEVICE_ID_REGEX = /^[0-9a-fA-F-]{16,64}$/;

/**
 * Resolve o device anonimo a partir do header x-device-id, criando o
 * registro no primeiro uso. Nao ha login: o UUID e gerado no app e
 * persistido localmente (Capacitor Preferences).
 */
export async function requireDeviceId(req: Request, res: Response, next: NextFunction) {
  const headerValue = req.header(DEVICE_ID_HEADER);

  if (!headerValue || !DEVICE_ID_REGEX.test(headerValue)) {
    return res.status(400).json({ error: `Header ${DEVICE_ID_HEADER} ausente ou invalido.` });
  }

  const device = await prisma.device.upsert({
    where: { deviceId: headerValue },
    update: { lastSeenAt: new Date() },
    create: { deviceId: headerValue },
  });

  req.device = device;
  next();
}
