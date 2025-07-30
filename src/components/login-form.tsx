"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginAction } from "@/app/actions/auth"
import { toast } from "sonner"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Package } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(async (prevState: any, formData: FormData) => {
    const result = await loginAction(formData)
    if (result?.success) {
      toast.success("¡Inicio de sesión exitoso! Redirigiendo...")
      router.push('/dashboard')
    } else if (result?.error) {
      toast.error(result.error)
    }
    return result
  }, null)

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form action={formAction} className="p-6 md:p-8">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center mb-4">
                  <Package className="h-8 w-8 text-primary mr-2" />
                  <h1 className="text-2xl font-bold">TodoFundas</h1>
                </div>
                <h2 className="text-xl font-semibold mb-2">Bienvenido de nuevo</h2>
                <p className="text-muted-foreground text-balance">
                  Inicia sesión en tu cuenta TodoFundas
                </p>
              </div>
              
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="username">Usuario</Label>
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
                    placeholder="**************" 
                    id="password" 
                    name="password" 
                    type="password" 
                    required 
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={pending}
                className="w-full cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {pending ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Button>
              
              <div className="text-center">
                <Link 
                  href="/register" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ¿No tienes cuenta? Crear cuenta
                </Link>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/img/cellphoneLogin.png"
              alt="Imagen"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
