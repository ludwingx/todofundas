import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ProductComboboxProps {
  products: any[];
  value: string;
  onChange: (val: string) => void;
}

export function ProductCombobox({ products, value, onChange }: ProductComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const safeProducts = Array.isArray(products) ? products : [];
  const selected = safeProducts.find(p => p.id === value);
  const getLabel = (p: any) => {
    const parts = [p.phoneModel?.name, p.type?.name, p.color].filter(Boolean);
    return parts.join(" - ");
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-background text-foreground"
        >
          {selected ? getLabel(selected) : "Selecciona un producto..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Buscar producto..." />
          <CommandList>
            <CommandEmpty>No hay productos.</CommandEmpty>
            <CommandGroup>
              {(Array.isArray(products) ? products : []).map((p) => (
                <CommandItem
                className="hover:cursor-pointer  hover:bg-primary/90"
                  key={p.id}
                  value={getLabel(p)}
                  onSelect={() => {
                    onChange(p.id);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === p.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {getLabel(p)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
