"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/actions/auth";
import { revalidatePath } from "next/cache";

export async function createWalletTransactionAction(data: {
  type: "ingreso" | "egreso";
  amount: number;
  reason: string;
  notes?: string;
  referenceType?: string;
  referenceId?: string;
}) {
  const session = await getSession();
  if (!session) {
    return { error: "No autorizado" };
  }

  try {
    const { type, amount, reason, notes, referenceType, referenceId } = data;

    if (!amount || amount <= 0) {
      return { error: "El monto debe ser mayor a 0" };
    }

    await prisma.walletTransaction.create({
      data: {
        type,
        amount,
        reason,
        notes,
        referenceType,
        referenceId,
        userId: session.userId as string,
      }
    });

    revalidatePath("/wallet");
    return { success: true };
  } catch (error) {
    console.error("Error creando transacción de wallet:", error);
    return { error: "Ocurrió un error al registrar la transacción" };
  }
}
