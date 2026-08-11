import express from "express";
import cors from "cors";
import { env } from "./lib/env";
import { scanRouter } from "./routes/scan";
import { productsRouter } from "./routes/products";
import { substancesRouter } from "./routes/substances";
import { adminAuthRouter } from "./routes/admin/auth";
import { adminSubstancesRouter } from "./routes/admin/substances";
import { adminProductsRouter } from "./routes/admin/products";
import { adminStatsRouter } from "./routes/admin/stats";

const app = express();

app.use(
  cors({
    origin: env.corsOrigins.length > 0 ? env.corsOrigins : true,
  })
);
app.use(express.json({ limit: "15mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

// ---- Rotas publicas do app mobile (identificadas por x-device-id) ----
app.use("/api/scan", scanRouter);
app.use("/api/products", productsRouter);
app.use("/api/substances", substancesRouter);

// ---- Painel admin oculto ----
// Prefixo vem de ADMIN_ROUTE_SLUG (env), nunca hardcoded e nunca referenciado
// pelo app mobile. So quem conhece a URL (+ credenciais) chega aqui.
const adminPrefix = `/api/${env.adminRouteSlug}-admin`;
app.use(`${adminPrefix}`, adminAuthRouter);
app.use(`${adminPrefix}/substances`, adminSubstancesRouter);
app.use(`${adminPrefix}/products`, adminProductsRouter);
app.use(`${adminPrefix}/stats`, adminStatsRouter);

app.listen(env.port, () => {
  console.log(`G6PD Scanner API rodando na porta ${env.port}`);
  console.log(`Painel admin (rota oculta): ${adminPrefix}/login`);
});
