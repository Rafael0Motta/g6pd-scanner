import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { requireDeviceId } from "../middleware/deviceId";
import { executarScan } from "../services/scanService";

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

export const scanRouter = Router();

const base64BodySchema = z.object({
  imageBase64: z.string().min(1),
  mediaType: z.enum(["image/jpeg", "image/png", "image/webp"]).default("image/jpeg"),
});

/**
 * POST /api/scan
 * Aceita a imagem via multipart/form-data (campo "image") OU JSON com
 * { imageBase64, mediaType }. Cria/atualiza o device automaticamente
 * (feito pelo middleware requireDeviceId) e salva o resultado em products.
 */
scanRouter.post("/", requireDeviceId, upload.single("image"), async (req, res) => {
  try {
    let base64Image: string;
    let mediaType: "image/jpeg" | "image/png" | "image/webp";

    if (req.file) {
      base64Image = req.file.buffer.toString("base64");
      const mimetype = req.file.mimetype;
      if (mimetype !== "image/jpeg" && mimetype !== "image/png" && mimetype !== "image/webp") {
        return res.status(400).json({ error: "Formato de imagem nao suportado. Use JPEG, PNG ou WEBP." });
      }
      mediaType = mimetype;
    } else {
      const parsed = base64BodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Envie uma imagem (multipart 'image' ou JSON com imageBase64)." });
      }
      base64Image = parsed.data.imageBase64;
      mediaType = parsed.data.mediaType;
    }

    const resultado = await executarScan({
      deviceId: req.device!.id,
      base64Image,
      mediaType,
    });

    res.status(201).json(resultado);
  } catch (error) {
    console.error("Erro no /api/scan:", error);
    res.status(500).json({ error: "Falha ao processar o scan. Tente novamente." });
  }
});
