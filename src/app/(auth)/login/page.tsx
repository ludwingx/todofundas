import { LoginForm } from "@/components/login-form"
import { ModeToggle } from "@/components/mode-toggle"
import { Footer } from "@/components/footer"

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-start px-4 md:px-8 pt-2 md:pt-8 pb-0">
      <div className="flex w-full max-w-sm md:max-w-3xl justify-end">
        <ModeToggle />
      </div>
      <div className="w-full max-w-sm md:max-w-3xl mt-8">
        <LoginForm />
      </div>
      <Footer />
    </div>
  )
}
