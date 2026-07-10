// Prisma klient pre bota (zdieľa rovnakú databázu ako web appka).
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({ log: ["error"] });
