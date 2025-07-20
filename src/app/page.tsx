import { Footer } from "@/components/footer";
import { LoginForm } from "@/components/login-form";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header con ModeToggle */}
      <div className="flex justify-end p-4">
        <ModeToggle />
      </div>
      
      {/* Contenido principal centrado */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-4xl">
          <LoginForm />
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4">
        <Footer />
      </div>
    </div>
  );
}
