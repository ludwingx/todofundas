import { z } from "zod";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";

// Zod schema para validación del registro
export const registerSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres").max(32),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(64),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export async function registerUser(input: RegisterInput) {
  // Validación
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    // Verificar unicidad del username
    const existing = await prisma.user.findUnique({ where: { username: input.username } });
    if (existing) {
      return {
        success: false,
        error: { username: ["El usuario ya existe"] },
      };
    }

    // Hash de la contraseña
    const hashedPassword = await hash(input.password, 10);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        name: input.username,
        username: input.username,
        password: hashedPassword,
        role: 'user',
        isActive: true,
      },
    });

    return {
      success: true,
      user: { id: user.id, username: user.username },
    };
  } catch (err: any) {
    return {
      success: false,
      error: { general: ["Error inesperado: " + (err.message || "")] },
    };
  }
}
