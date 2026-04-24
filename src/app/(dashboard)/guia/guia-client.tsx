"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  Database,
  Briefcase,
  TrendingUp,
  ExternalLink,
  ShieldCheck,
  UserCircle,
  Trophy,
  BadgeCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { completeTutorialAction } from "@/app/actions/users";
import { toast } from "sonner";

type CompletedItems = {
  marcas: boolean;
  tipos: boolean;
  materiales: boolean;
  modelos: boolean;
  colores: boolean;
  productos: boolean;
  compras: boolean;
  ventas: boolean;
  wallet: boolean;
  proveedores: boolean;
};

interface GuiaClientProps {
  completedItems: CompletedItems;
}

/** Badge de "Verificado / Completado" reutilizable */
function CompletedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-green-600 border border-green-500/20">
      <BadgeCheck className="h-3 w-3" />
      Completado
    </span>
  );
}

/** Indicador en cada sub-paso de si ya está hecho */
function StepStatusDot({ done }: { done: boolean }) {
  return done ? (
    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
  ) : (
    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
  );
}

const STEPS = [
  {
    id: "bases",
    title: "1. Cimientos",
    subtitle: "Configuración Base",
    role: "admin",
    description:
      "Lo primero es definir las reglas de tu negocio. Marcas, materiales y tipos de productos.",
    icon: Database,
    color: "blue",
    nextId: "stock",
    details: [
      {
        key: "marcas" as keyof CompletedItems,
        title: "Registrar Marcas",
        desc: "Define quién fabrica tus productos.",
        link: "/configuracion/marcas",
      },
      {
        key: "tipos" as keyof CompletedItems,
        title: "Tipos de Productos",
        desc: "Categoriza lo que vendes (Fundas, Micas).",
        link: "/configuracion/tipos",
      },
      {
        key: "materiales" as keyof CompletedItems,
        title: "Materiales",
        desc: "Especifica de qué están hechos.",
        link: "/configuracion/materiales",
      },
      {
        key: "proveedores" as keyof CompletedItems,
        title: "Proveedores",
        desc: "Registra quiénes te surten de mercadería.",
        link: "/configuracion/proveedores",
      },
    ],
  },
  {
    id: "stock",
    title: "2. Estructura",
    subtitle: "Modelos y Catálogo",
    role: "admin",
    description:
      "Una vez tienes las bases, organiza tus modelos de teléfono y los productos específicos.",
    icon: Briefcase,
    color: "purple",
    nextId: "flujo",
    details: [
      {
        key: "modelos" as keyof CompletedItems,
        title: "Crear Modelos",
        desc: "Asocia modelos a tus marcas registradas.",
        link: "/configuracion/modelos",
      },
      {
        key: "colores" as keyof CompletedItems,
        title: "Colores y Variantes",
        desc: "Define la paleta de colores para tus productos.",
        link: "/configuracion/colores",
      },
      {
        key: "productos" as keyof CompletedItems,
        title: "Alta de Productos",
        desc: "Crea el catálogo final de venta.",
        link: "/inventario/productos",
      },
    ],
  },
  {
    id: "flujo",
    title: "3. Acción",
    subtitle: "Operación Diaria",
    role: "vendedor",
    description:
      "¡Hora de vender! Gestiona tus compras de stock, ventas a clientes y el flujo de tu billetera.",
    icon: TrendingUp,
    color: "green",
    nextId: null,
    details: [
      {
        key: "compras" as keyof CompletedItems,
        title: "Compras (Entrada)",
        desc: "Registra entradas de stock.",
        link: "/compras",
      },
      {
        key: "ventas" as keyof CompletedItems,
        title: "Ventas (Salida)",
        desc: "Cada venta suma dinero a tu Wallet.",
        link: "/ventas",
      },
      {
        key: "wallet" as keyof CompletedItems,
        title: "Wallet (Caja)",
        desc: "Controla tu balance real y reportes.",
        link: "/wallet",
      },
    ],
  },
] as const;

export function GuiaClient({ completedItems }: GuiaClientProps) {
  const [activeStepId, setActiveStepId] = useState(STEPS[0].id);
  const [isFinishing, setIsFinishing] = useState(false);
  const activeStep = STEPS.find((s) => s.id === activeStepId)!;

  const handleNext = () => {
    if (activeStep.nextId) {
      setActiveStepId(activeStep.nextId as typeof activeStepId);
    }
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      const res = await completeTutorialAction();
      if (res.success) {
        toast.success("¡Tutorial completado!", {
          description: "Ya tienes las bases para operar Market GS con éxito.",
        });
        window.location.href = "/dashboard";
      } else {
        toast.error("Error al guardar progreso");
      }
    } catch {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsFinishing(false);
    }
  };

  /** Determina si todos los ítems con key de un paso están completados */
  const isStepDone = (stepId: string) => {
    const step = STEPS.find((s) => s.id === stepId);
    if (!step) return false;
    return step.details.every(
      (d) => d.key === null || completedItems[d.key as keyof CompletedItems]
    );
  };

  return (
    <div className="flex-1 space-y-12 p-8 pt-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4 animate-in fade-in slide-in-from-top duration-700">
        <div className="flex items-center justify-center gap-2">
          <Badge
            variant="secondary"
            className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border-none"
          >
            Tutorial Interactivo
          </Badge>
        </div>
        <h2 className="text-4xl font-black tracking-tight uppercase italic leading-none">
          Dominando{" "}
          <span className="text-primary underline decoration-4 underline-offset-8">
            Market GS
          </span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Sigue esta ruta de aprendizaje para entender el sistema al 100% y
          operar como un experto.
        </p>
      </div>

      {/* Selector de 3 Etapas */}
      <div className="grid gap-4 md:grid-cols-3">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = activeStepId === step.id;
          const done = isStepDone(step.id);

          const colorClasses = {
            blue: {
              border: "border-blue-500",
              bg: "bg-blue-500",
              shadow: "shadow-blue-500/10",
              text: "text-blue-500",
            },
            purple: {
              border: "border-purple-500",
              bg: "bg-purple-500",
              shadow: "shadow-purple-500/10",
              text: "text-purple-500",
            },
            green: {
              border: "border-green-500",
              bg: "bg-green-500",
              shadow: "shadow-green-500/10",
              text: "text-green-500",
            },
          }[step.color as "blue" | "purple" | "green"];

          return (
            <button
              key={step.id}
              onClick={() => setActiveStepId(step.id as typeof activeStepId)}
              className={cn(
                "relative group text-left transition-all duration-300 outline-none",
                isActive ? "scale-105" : "hover:scale-102 opacity-50 hover:opacity-100"
              )}
            >
              <Card
                className={cn(
                  "h-full border-2 transition-all duration-500 overflow-hidden",
                  isActive
                    ? `${colorClasses.border} shadow-2xl ${colorClasses.shadow}`
                    : "border-transparent bg-muted/30"
                )}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div
                      className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6",
                        isActive
                          ? `${colorClasses.bg} text-white shadow-lg`
                          : "bg-background text-muted-foreground"
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    {done && (
                      <BadgeCheck className="h-5 w-5 text-green-500 shrink-0" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-lg uppercase tracking-tight leading-none">
                        {step.title}
                      </h3>
                      {step.role === "admin" ? (
                        <span title="Solo Admin">
                          <ShieldCheck className="h-3 w-3 text-blue-500" />
                        </span>
                      ) : (
                        <span title="Vendedores">
                          <UserCircle className="h-3 w-3 text-green-500" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-70">
                      {step.subtitle}
                    </p>
                    {done && <CompletedBadge />}
                  </div>
                </CardContent>
                {isActive && (
                  <div
                    className={cn(
                      "absolute bottom-0 left-0 h-1 w-full",
                      colorClasses.bg
                    )}
                  />
                )}
              </Card>
            </button>
          );
        })}
      </div>

      {/* Detalle dinámico */}
      <div
        key={activeStepId}
        className="animate-in fade-in slide-in-from-bottom duration-500"
      >
        <Card className="border-none bg-muted/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <activeStep.icon size={200} />
          </div>

          <CardContent className="p-8 md:p-12 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="border-primary/20 text-primary uppercase tracking-tighter"
                    >
                      {activeStep.role === "admin"
                        ? "Perfil Administrador"
                        : "Perfil Operativo"}
                    </Badge>
                    {isStepDone(activeStepId) && <CompletedBadge />}
                  </div>
                  <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
                    {activeStep.subtitle}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-lg italic max-w-md">
                    &ldquo;{activeStep.description}&rdquo;
                  </p>
                </div>

                {/* Lista de sub-pasos con estado real */}
                <div className="space-y-6">
                  {activeStep.details.map((detail, i) => {
                    const isDone =
                      detail.key !== null
                        ? completedItems[detail.key as keyof CompletedItems]
                        : false;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex gap-4 items-center p-4 rounded-2xl border transition-all group",
                          isDone
                            ? "bg-green-500/5 border-green-500/20"
                            : "bg-background/50 border-transparent hover:border-primary/10"
                        )}
                      >
                        <div
                          className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                            isDone
                              ? "bg-green-500/15"
                              : "bg-green-500/10"
                          )}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <span className="font-black text-xs text-green-600">
                              0{i + 1}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm uppercase">
                              {detail.title}
                            </h4>
                            {isDone && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-widest text-green-600">
                                <BadgeCheck className="h-3 w-3" />
                                listo
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {detail.desc}
                          </p>
                        </div>
                        <Link href={detail.link}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-4 pt-4">
                  {activeStep.nextId ? (
                    <Button
                      onClick={handleNext}
                      className="rounded-full px-8 h-12 font-black uppercase tracking-widest group"
                    >
                      Siguiente Etapa{" "}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleFinish}
                      disabled={isFinishing}
                      className="rounded-full px-8 h-12 font-black uppercase tracking-widest bg-green-600 hover:bg-green-700 gap-2"
                    >
                      <Trophy className="h-4 w-4" />
                      {isFinishing ? "Guardando..." : "Finalizar Tutorial"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Visual Tutorial Area */}
              <div className="hidden lg:block space-y-4">
                <div className="p-8 border-2 border-dashed rounded-3xl border-primary/10 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px] bg-background/30 backdrop-blur-sm">
                  <div
                    className={cn(
                      "h-20 w-20 rounded-3xl flex items-center justify-center shadow-2xl",
                      activeStepId === "bases"
                        ? "bg-blue-500 shadow-blue-500/20"
                        : activeStepId === "stock"
                        ? "bg-purple-500 shadow-purple-500/20"
                        : "bg-green-500 shadow-green-500/20"
                    )}
                  >
                    <activeStep.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-black uppercase tracking-tighter text-xl text-primary">
                      {isStepDone(activeStepId)
                        ? "¡Misión Completada!"
                        : "Objetivo Actual"}
                    </p>
                    {isStepDone(activeStepId) ? (
                      <div className="flex flex-col items-center gap-2">
                        <BadgeCheck className="h-10 w-10 text-green-500" />
                        <p className="text-sm text-green-600 font-bold italic px-8">
                          Esta etapa ya está configurada en tu sistema.
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic px-8">
                        {activeStepId === "bases"
                          ? "Sentar las bases lógicas para que el inventario nunca se desorganice."
                          : activeStepId === "stock"
                          ? "Crear el catálogo de productos listo para recibir stock."
                          : "Gestionar ventas y monitorear el crecimiento del negocio."}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Footer */}
      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="flex gap-2">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                activeStepId === s.id
                  ? "bg-primary w-24"
                  : isStepDone(s.id)
                  ? "bg-green-500 w-12"
                  : "bg-muted-foreground/20 w-12"
              )}
            />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.4em] font-medium">
          Market G/S • Ruta de Aprendizaje • v1.0
        </p>
      </div>
    </div>
  );
}
