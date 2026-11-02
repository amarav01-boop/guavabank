import Fastify from "fastify";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.get("/health", async () => ({
    service: "guavabank-api",
    status: "ok"
  }));

  return app;
}
