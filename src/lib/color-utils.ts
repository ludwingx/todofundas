import { DEFAULT_COLORS } from "@/components/ui/color-selector";

interface ColorOption {
  name: string;
  value: string;
}

export function getColorName(hex: string | null | undefined): string {
  if (!hex) return 'Sin color';
  
  // Handle transparent case
  if (hex.toLowerCase() === 'transparent') return 'Transparente';
  
  // Normalize hex code (remove # if present and convert to lowercase)
  const normalizedHex = hex.startsWith('#') ? hex.slice(1).toLowerCase() : hex.toLowerCase();
  
  // Find the color in the DEFAULT_COLORS array
  const color = DEFAULT_COLORS.find((c: ColorOption) => {
    const colorHex = c.value.startsWith('#') ? c.value.slice(1).toLowerCase() : c.value.toLowerCase();
    return colorHex === normalizedHex;
  });
  
  return color ? color.name : hex; // Return the color name or the original hex if not found
}
