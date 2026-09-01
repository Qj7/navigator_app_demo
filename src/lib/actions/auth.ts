"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getSession,
} from "@/lib/auth";

export type LoginState = {
  error?: string;
  ok?: boolean;
};

export async function loginAction(
  _prev: LoginState | null,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Введите email и пароль" };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { error: "Неверный email или пароль" };
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return { error: "Неверный email или пароль" };
    }

    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    await setSessionCookie(token);

    return { ok: true };
  } catch (error) {
    console.error("[loginAction]", error);
    return { error: "Неверный email или пароль" };
  }
}

export async function logout() {
  await clearSessionCookie();
  redirect("/login");
}

export async function getCurrentSession() {
  return getSession();
}
