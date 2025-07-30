"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUserAction } from "@/app/actions/auth";
import { toast } from "sonner";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Package, User, Lock, UserPlus } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await createUserAction(formData);
      if (result?.success) {
        toast.success("¡Cuenta creada correctamente! Redirigiendo al login...");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else if (result?.error) {
        toast.error(result.error);
      }
      return result;
    },
    null
  );

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form action={formAction} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center mb-4">
                  <Package className="h-8 w-8 text-primary mr-2" />
                  <h1 className="text-2xl font-bold">TodoFundas</h1>
                </div>
                <h2 className="text-xl font-semibold">Crear cuenta</h2>
                <p className="text-muted-foreground text-balance">
                  Únete a TodoFundas y gestiona tu inventario
                </p>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="username">Nombre de usuario</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="tu_usuario"
                    required
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={pending}
                className="w-full cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {pending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear cuenta
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ¿Ya tienes cuenta? Iniciar sesión
                </Link>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/img/cellphoneLogin.png"
              alt="Registro TodoFundas"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
