import { PrismaClient } from "@prisma/client";

// Patron Singleton para evitar múltiples instancias en desarrollo (hot-reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Configuración optimizada para Supabase con connection pooling
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// En desarrollo, guardar instancia global para evitar crear múltiples clientes
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Manejo de cierre graceful de conexiones
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Función para cerrar conexiones manualmente
export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};

export default prisma;
