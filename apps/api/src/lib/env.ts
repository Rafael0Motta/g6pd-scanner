import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variavel de ambiente obrigatoria ausente: ${name}`);
  }
  return value;
}

export const env = {
  databaseUrl: required("DATABASE_URL"),
  anthropicApiKey: required("ANTHROPIC_API_KEY"),
  jwtSecret: required("JWT_SECRET"),
  adminRouteSlug: required("ADMIN_ROUTE_SLUG"),
  port: Number(process.env.PORT ?? 3333),
  corsOrigins: (process.env.CORS_ORIGINS ?? "").split(",").map((o) => o.trim()).filter(Boolean),
};
