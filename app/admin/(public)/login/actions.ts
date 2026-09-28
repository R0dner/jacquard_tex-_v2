"use server";
import { adminSignIn } from "@/auth-admin";
import { AuthError } from "next-auth";

export async function loginAdmin(prevState: any, formData: FormData) {
  try {
    await adminSignIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin/productos/nuevo",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Correo o contraseña incorrectos, o la cuenta está desactivada." };
    }
    throw error;
  }
}

export async function loginGoogle() {
  await adminSignIn("google", { redirectTo: "/admin/productos/nuevo" });
}