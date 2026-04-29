import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

// Leer el archivo de tipos de dispositivos
function getIPhoneModels(): string[] {
  try {
    const filePath = join(process.cwd(), 'src/app/api/phone-models/types_Devices.md');
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    const models: string[] = [];
    for (const line of lines) {
      const match = line.match(/^iPhone\d+,\d+ : (.+)$/);
      if (match) {
        // Eliminar el prefijo "iPhone" del nombre
        const modelName = match[1].replace(/^iPhone\s+/, '');
        models.push(modelName);
      }
    }

    return models;
  } catch (error) {
    console.error('Error al leer types_Devices.md:', error);
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const { brandName, existingModels, count = 5 } = await req.json();

    if (!brandName) {
      return NextResponse.json({ error: 'Marca requerida' }, { status: 400 });
    }

    const apiKey = process.env.OPEN_ROUTER_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenRouter API Key no configurada' }, { status: 500 });
    }

    const now = new Date();
    const currentDate = now.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    // Lógica para determinar el último modelo lanzado (Apple lanza en Septiembre)
    // 2024 -> iPhone 16
    // 2025 -> iPhone 17
    // 2026 -> iPhone 18 (pero solo a partir de Septiembre)
    let latestConfirmedSeries = currentYear - 2008;
    if (currentMonth < 9) {
      latestConfirmedSeries -= 1;
    }

    // Obtener modelos reales del archivo
    const allModels = getIPhoneModels();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://marketgs.com",
        "X-Title": "Market GS",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: [
          {
            role: "system",
            content: `Eres un experto en tecnología móvil. Hoy es ${currentDate}.
            REGLA DE ORO: El modelo más reciente LANZADO oficialmente para Apple es la serie ${latestConfirmedSeries}.
            PROHIBIDO: NO sugieras modelos de la serie ${latestConfirmedSeries + 1} o superiores, ya que aún no existen en el mercado.
            ORDEN: Del más nuevo al más antiguo.
            IMPORTANTE: Usa EXACTAMENTE los nombres de la lista proporcionada. No inventes nombres.`
          },
          {
            role: "user",
            content: `
              De esta lista de modelos reales de iPhone, selecciona los ${count} más recientes hoy ${currentDate}:
              ${allModels.join('\n')}

              REGLAS IMPORTANTES:
              - El tope máximo es la serie ${latestConfirmedSeries}.
              - NO incluyas la marca "${brandName}".
              - EXCLUYE ESTOS MODELOS QUE YA EXISTEN: ${existingModels.join(', ')}.
              - NO sugieras NINGUNO de los modelos en la lista de exclusiones.
              - Solo sugiere modelos que NO estén en la lista de exclusiones.
              - Formato: Solo nombres separados por comas, sin texto extra.
              - Usa EXACTAMENTE los nombres de la lista, no los modifiques.
            `
          }
        ],
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Error en OpenRouter');
    }

    const content = data.choices[0]?.message?.content || '';
    const suggestedModels = content
      .split(',')
      .map((m: string) => m.trim())
      .filter((m: string) => m.length > 0)
      .filter((m: string) => !existingModels.includes(m))
      .slice(0, count);

    return NextResponse.json({ suggestedModels });

  } catch (error: any) {
    console.error('Error en AI suggestion:', error);
    return NextResponse.json({ error: error.message || 'Error al obtener sugerencias' }, { status: 500 });
  }
}
