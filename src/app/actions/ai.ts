"use server";

import { uploadToOBFiles } from "@/lib/ob-files";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function getApiKey(): string | null {
  return process.env.OPEN_ROUTER_KEY || null;
}

export interface AIActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Genera una imagen mejorada basada en una imagen original (Image-to-Image)
 * Usando Gemini 3.1 Flash Image Preview (OpenRouter)
 */
export async function improveProductImage(
  base64Image: string, // Data URL base64
  prompt: string
): Promise<AIActionResult<string>> {
  const apiKey = getApiKey();
  if (!apiKey) return { success: false, error: "OPEN_ROUTER_KEY no configurada" };

  try {
    const finalPrompt = `Professional product photography: ${prompt}. 
    COMPOSITION RULES: 
    1. Front view only, perfectly centered.
    2. SOLID CLEAN WHITE BACKGROUND.
    3. ONLY THE PRODUCT, absolutely no other objects, no hands, no humans.
    4. High resolution, studio lighting, ultra-realistic.
    CRITICAL: DO NOT INCLUDE ANY TEXT, LETTERS, NUMBERS, WORDS, OR TITLES IN THE IMAGE.`;

    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: finalPrompt },
              { type: "image_url", image_url: { url: base64Image } },
            ],
          },
        ],
        // @ts-ignore
        modalities: ["image", "text"],
        max_tokens: 4000,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `OpenRouter error: ${err}` };
    }

    const data = await res.json();
    const images = data.choices?.[0]?.message?.images;
    let generatedBase64: string | null = null;
    let mimeType = "image/png";

    // Extraer la imagen del formato de respuesta de Gemini en OpenRouter
    if (Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        if (img.image_url?.url) {
          const dataUrl = img.image_url.url as string;
          if (dataUrl.startsWith("data:")) {
            const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
              mimeType = match[1];
              generatedBase64 = match[2];
              break;
            }
          }
        }
      }
    }

    if (!generatedBase64) {
      return { success: false, error: "La IA no devolvió ninguna imagen en el formato esperado." };
    }

    // Subir a OB_FILES
    const uploadResult = await uploadToOBFiles(generatedBase64, `ai_improve_${Date.now()}.png`, mimeType);
    
    if (!uploadResult.success || !uploadResult.url) {
      return { success: false, error: uploadResult.error || "Error subiendo a OB_FILES" };
    }

    return { 
      success: true, 
      data: uploadResult.url 
    };
  } catch (error: any) {
    console.error("Error in improveProductImage:", error);
    return { success: false, error: error.message || "Error desconocido" };
  }
}

/**
 * Genera una imagen desde cero (DALL-E 3 o Gemini si lo soporta)
 */
export async function generateNewProductImage(
  prompt: string
): Promise<AIActionResult<string>> {
  const apiKey = getApiKey();
  if (!apiKey) return { success: false, error: "OPEN_ROUTER_KEY no configurada" };

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [{ role: "user", content: prompt }],
        // @ts-ignore
        modalities: ["image", "text"],
      }),
    });

    if (!res.ok) return { success: false, error: "Error en API" };
    const data = await res.json();
    
    // Mismo parsing que arriba
    const images = data.choices?.[0]?.message?.images;
    if (Array.isArray(images) && images.length > 0) {
      const dataUrl = images[0].image_url.url;
      const base64 = dataUrl.split(",")[1];
      const upload = await uploadToOBFiles(base64, `ai_gen_${Date.now()}.png`, "image/png");
      return { success: true, data: upload.url };
    }

    return { success: false, error: "No se generó imagen" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Analiza una imagen para detectar atributos del producto
 */
export async function analyzeProductImage(
  base64Image: string
): Promise<AIActionResult<{
  type?: string;
  brand?: string;
  model?: string;
  color?: string;
  hexCode?: string;
  material?: string;
}>> {
  const apiKey = getApiKey();
  if (!apiKey) return { success: false, error: "OPEN_ROUTER_KEY no configurada" };

  try {
    const uploadResult = await uploadToOBFiles(base64Image.split(",")[1], `analyze_${Date.now()}.png`, "image/png");
    if (!uploadResult.success || !uploadResult.url) {
      return { success: false, error: "Error subiendo imagen temporal" };
    }

    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://todofundas.com",
        "X-Title": "TodoFundas",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: `Analiza esta imagen de un accesorio para celular y devuelve un objeto JSON estructurado.
                
                CAMPOS REQUERIDOS:
                - type: El tipo de producto (ej: "Funda", "Protector de pantalla", "Cargador").
                - brand: La marca del celular (ej: "Apple", "Samsung", "Xiaomi").
                - model: El modelo de celular SIN la marca (ej: "15 Pro Max", "S24 Ultra", "Redmi Note 12"). 
                - color: Nombre del color en español (ej: "Verde Esmeralda", "Gris Espacial").
                - hexCode: El código hexadecimal exacto del color (ej: "#2E4739").
                - material: El material predominante (ej: "Silicona", "Cuero", "PC Rígido").
                
                REGLAS:
                1. Responde ÚNICAMENTE con el objeto JSON.
                2. No incluyas bloques de código markdown (\`\`\`json).
                3. El campo 'model' NO debe incluir la marca, solo el número/nombre del modelo.` 
              },
              { type: "image_url", image_url: { url: uploadResult.url } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Error en análisis: ${err}` };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) return { success: false, error: "La IA no devolvió análisis" };

    const parsed = JSON.parse(content.replace(/```json|```/g, "").trim());
    return { success: true, data: parsed };
  } catch (error: any) {
    console.error("Error analyzing image:", error);
    return { success: false, error: error.message };
  }
}
