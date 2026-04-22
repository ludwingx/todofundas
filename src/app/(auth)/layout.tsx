import { ThemeSwitch } from "@/components/theme-switch";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-muted/40 dark:bg-background p-4 md:p-8">
      <div className="w-full flex flex-col items-center justify-center gap-6">
        {children}
        <div className="mt-2">
          <ThemeSwitch />
        </div>
      </div>
    </div>
  );
}
