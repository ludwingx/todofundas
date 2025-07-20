import { Footer } from "@/components/footer";
import { RegisterForm } from "@/components/register-form";
import { ModeToggle } from "@/components/mode-toggle";

export default function RegisterPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-start px-4 md:px-8 pt-2 md:pt-8 pb-0">
      <div className="flex w-full max-w-sm md:max-w-3xl justify-end">
        <ModeToggle />
      </div>
      <div className="w-full max-w-sm md:max-w-3xl mt-2">
        <RegisterForm />
      </div>
      <Footer />
    </div>
  );
}
