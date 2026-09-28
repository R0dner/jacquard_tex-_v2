import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const passwordHash = await bcrypt.hash("69827095Roni.,", 10);
  const admin = await prisma.usuario.create({
    data: {
      nombre: "Ronald",
      email: "ronisp200@gmail.com",
      passwordHash,
      rol: "ADMIN_PRINCIPAL",
    },
  });
  console.log("Admin creado:", admin.email);
}

main().then(() => process.exit(0));