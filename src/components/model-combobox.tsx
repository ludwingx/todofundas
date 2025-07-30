"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fetchPhoneModels, createPhoneModel, deletePhoneModel, updatePhoneModel } from "@/lib/phone-models-api";

export function ModelCombobox({ name, required }: { name: string; required?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [models, setModels] = React.useState<{ id: string; name: string }[]>([]);
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string>("");
  const [selectedName, setSelectedName] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Cargar modelos al abrir el combobox
  React.useEffect(() => {
    if (open) {
      setLoading(true);
      fetchPhoneModels().then((data) => {
        setModels(data);
        setLoading(false);
      });
    }
  }, [open]);

  React.useEffect(() => {
    // Si el form se resetea, limpia el valor
    const form = inputRef.current?.form;
    if (form) {
      const listener = () => {
        setSelectedId("");
        setSelectedName("");
      };
      form.addEventListener("reset", listener);
      return () => form.removeEventListener("reset", listener);
    }
  }, []);

  // Estado para edición/eliminación
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");

  // Filtrado local
  const filtered = query.length
    ? models.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()))
    : models;

  // Guardar edición de modelo
  async function handleSaveEdit(id: string) {
    if (!editValue.trim() || editValue.trim().length < 2) return;
    setLoading(true);
    try {
      const updated = await updatePhoneModel(id, editValue.trim());
      setModels(models => models.map(m => m.id === id ? updated : m));
      // Si estaba seleccionado, actualiza el nombre mostrado
      if (selectedId === id) setSelectedName(updated.name);
      setEditingId(null);
    } catch (e) {
      alert('Error al editar modelo');
    }
    setLoading(false);
  }

  // Eliminar modelo
  async function handleDelete(id: string) {
    if (!window.confirm('¿Seguro que quieres eliminar este modelo?')) return;
    setLoading(true);
    try {
      await deletePhoneModel(id);
      setModels(models => models.filter(m => m.id !== id));
      if (selectedId === id) {
        setSelectedId("");
        setSelectedName("");
      }
    } catch (e) {
      alert('Error al eliminar modelo');
    }
    setLoading(false);
  }

  // Añadir modelo nuevo
  async function handleAddModel() {
    if (!query.trim()) return;
    setLoading(true);
    const created = await createPhoneModel(query.trim());
    setLoading(false);
    if (created) {
      setModels((prev) => [...prev, created]);
      setSelectedId(created.id);
      setSelectedName(created.name);
      setOpen(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm hover:bg-accent",
            !selectedName && "text-muted-foreground"
          )}
          aria-expanded={open}
        >
          {selectedName ? selectedName : "Selecciona un modelo..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 max-h-72 overflow-y-auto">
        <Command>
          <CommandInput
            placeholder="Buscar modelo..."
            className="h-9"
            value={query}
            onValueChange={setQuery}
            disabled={loading}
          />
          <CommandEmpty>
            <div className="flex items-center justify-between gap-2 px-2 py-2">
              <span className="text-sm">Añadir modelo:</span>
              <span className="font-semibold text-sm truncate max-w-[140px]">{query}</span>
              <button
                type="button"
                className="ml-2 inline-flex items-center justify-center rounded-full border border-primary bg-primary text-primary-foreground hover:bg-primary/90 transition h-7 w-7 disabled:opacity-50 disabled:pointer-events-none"
                disabled={loading || !query.trim()}
                onMouseDown={e => e.preventDefault()}
                onClick={handleAddModel}
                title="Agregar modelo"
              >
                <span className="sr-only">Agregar modelo</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              </button>
            </div>
          </CommandEmpty>
          <CommandGroup>
            <CommandList>
              {filtered.map((model) => (
                <div key={model.id} className="flex items-center group hover:bg-accent/60 px-2 py-1 rounded transition">
                  <CommandItem
                    value={model.name}
                    onSelect={() => {
                      setSelectedId(model.id);
                      setSelectedName(model.name);
                      setOpen(false);
                    }}
                    className="flex-1 min-w-0 px-0 py-0 bg-transparent hover:bg-transparent cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedId === model.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{editingId === model.id ? (
                      <input
                        type="text"
                        className="border rounded px-1 py-0.5 text-sm w-32 mr-2"
                        value={editValue}
                        autoFocus
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveEdit(model.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                    ) : model.name}</span>
                  </CommandItem>
                  {editingId === model.id ? (
                    <>
                      <button
                        className="ml-1 text-primary hover:underline text-xs"
                        onClick={() => handleSaveEdit(model.id)}
                        disabled={editValue.trim().length < 2 || loading}
                        title="Guardar"
                      >✔</button>
                      <button
                        className="ml-1 text-destructive hover:underline text-xs"
                        onClick={() => setEditingId(null)}
                        title="Cancelar"
                      >✖</button>
                    </>
                  ) : (
                    <>
                      <button
                        className="ml-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition"
                        onClick={e => { e.stopPropagation(); setEditingId(model.id); setEditValue(model.name); }}
                        title="Editar"
                        tabIndex={-1}
                      >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6.586-6.586a2 2 0 112.828 2.828L11.828 13.828a2 2 0 01-2.828 0L9 13V11z"/></svg>
                      </button>
                      <button
                        className="ml-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                        onClick={e => { e.stopPropagation(); handleDelete(model.id); }}
                        title="Eliminar"
                        tabIndex={-1}
                      >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </>
                  )}
                </div>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
      {/* Campo oculto para enviar el valor real al formulario */}
      <input
        ref={inputRef}
        type="hidden"
        name={name}
        value={selectedId}
        required={required}
        readOnly
      />
    </Popover>
  );
}

