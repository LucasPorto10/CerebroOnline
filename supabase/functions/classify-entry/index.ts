// Setup type definitions for Supabase Edge Runtime
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
        if (!GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY')

        const { content } = await req.json()
        if (!content) throw new Error('Content is required')

        const prompt = `
Analise o texto e classifique-o para o app CerebroOnline (by PortoSol).
Categorias: home, work, uni, ideas.
Tipos: task, note, insight, bookmark, goal.

IMPORTANTE: Se for uma META (ex: "correr 5km", "estudar 2h", "meta: ler 10 paginas"), use obrigatoriamente entry_type: 'goal'.

Retorne APENAS JSON:
{
  "_thought_process": "razão da escolha em português",
  "category_slug": "home" | "work" | "uni" | "ideas",
  "entry_type": "task" | "note" | "insight" | "bookmark" | "goal",
  "metadata": {
    "summary": "resumo curto em português",
    "tags": ["tag1", "tag2"],
    "emoji": "🎯",
    "target": number,
    "unit": "string",
    "period_type": "weekly" | "monthly"
  }
}

Texto: "${content}"
`

        const model = 'gemini-flash-lite-latest'
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        })

        if (!response.ok) {
            const err = await response.text()
            throw new Error(`API Error ${response.status}: ${err}`)
        }

        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (!text) {
            console.error("Payload:", JSON.stringify(data))
            throw new Error("Empty AI response")
        }

        const result = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || text)

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error: any) {
        console.error("Error:", error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
