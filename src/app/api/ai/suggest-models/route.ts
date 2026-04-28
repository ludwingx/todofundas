import { NextRequest, NextResponse } from 'next/server';

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
            LÓGICA: Air, Pro Max, Pro, Base.
            ORDEN: Del más nuevo al más antiguo.
            IMPORTANTE: Para el modelo base, NO incluyas la palabra "Base". Solo usa el número de la serie (ejemplo: "16", no "16 Base").`
          },
          { 
            role: "user", 
            content: `
              Genera una lista de los ${count} modelos de "${brandName}" más recientes hoy ${currentDate}.
            - El tope máximo para Apple es la serie ${latestConfirmedSeries}.
            - SOLO el nombre (Ejemplo: "${latestConfirmedSeries} Pro Max", NO "Serie ${latestConfirmedSeries} Pro Max").
            - NO incluyas la marca "${brandName}".
            - No repitas estos: ${existingModels.join(', ')}.
            - Formato: Solo nombres separados por comas, sin texto extra.
             
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
      .slice(0, count);

    return NextResponse.json({ suggestedModels });

  } catch (error: any) {
    console.error('Error en AI suggestion:', error);
    return NextResponse.json({ error: error.message || 'Error al obtener sugerencias' }, { status: 500 });
  }
}
