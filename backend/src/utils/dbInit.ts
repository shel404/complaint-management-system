import { PrismaClient } from "@prisma/client";
import { hashPassword } from "./auth";

const prisma = new PrismaClient();

export const initializeDatabase = async () => {
  try {
    // Check if admin exists
    const adminExists = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!adminExists) {
      const { hash, salt } = hashPassword(process.env.DEFAULT_ADMIN_PASSWORD!);

      await prisma.user.create({
        data: {
          name: process.env.DEFAULT_ADMIN_NAME!,
          email: process.env.DEFAULT_ADMIN_EMAIL!,
          password: hash,
          salt,
          role: "ADMIN",
        },
      });

      console.log("[server]: Default admin account created");
    }
  } catch (error) {
    console.error("[server]: Error initializing database:", error);
  }
};
