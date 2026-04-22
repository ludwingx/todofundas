import { ModeToggle } from "@/components/mode-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-muted/40 dark:bg-background p-4 md:p-8">
      <div className="absolute top-4 right-4 md:top-8 md:right-8">
        <ModeToggle />
      </div>
      <div className="w-full flex justify-center">
        {children}
      </div>
    </div>
  );
}
