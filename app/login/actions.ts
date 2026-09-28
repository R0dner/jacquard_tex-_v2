"use server";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function loginCliente(prevState: any, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Correo o contraseña incorrectos." };
    }
    throw error;
  }
}

export async function loginGoogleCliente() {
  await signIn("google", { redirectTo: "/" });
}