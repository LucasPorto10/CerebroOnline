// Setup type definitions for Supabase Edge Runtime
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

        const today = new Date().toISOString()
        const prompt = `
Contexto: Hoje é ${today}.
Você é um assistente inteligente que classifica textos para o app CerebroOnline.

## CATEGORIAS
- home: tarefas domésticas, pessoais, família
- work: trabalho, projetos profissionais
- uni: estudos, universidade, cursos
- ideas: ideias, brainstorm, projetos futuros

## TIPOS
- task: tarefa a fazer
- note: anotação simples
- insight: ideia/reflexão
- bookmark: link/referência
- goal: META com objetivo numérico (ex: "correr 5km", "estudar 2h")

## REGRAS CRÍTICAS DE EXTRAÇÃO

### 1. PRIORIDADE (MUITO IMPORTANTE - ANALISE COM CUIDADO!)
Procure ATIVAMENTE por palavras-chave de prioridade no texto:

**URGENTE (urgent):** "urgente", "urgência", "agora", "imediato", "asap", "crítico", "emergência", "pra ontem"
**ALTA (high):** "importante", "prioridade", "essencial", "necessário", "preciso muito"  
**MÉDIA (medium):** "quando puder", "sem pressa", "normal", "depois"
**BAIXA (low):** "talvez", "um dia", "se der tempo", "opcional"

⚠️ REGRA ABSOLUTA: Se o texto contiver "URGENTE" ou "PRA ONTEM", a prioridade DEVE ser "urgent" e o tipo DEVE ser "task".
⚠️ VERBOS DE AÇÃO = TASK: Se começar com verbo no infinitivo ou imperativo (ex: "comprar", "fazer", "ir", "ligar", "pagar", "agendar", "tomar"), o tipo DEVE ser "task".
⚠️ CATEGORIA PADRÃO: Se não souber classificar, use "ideas" ou "home".
⚠️ TIPO PADRÃO: Se parecer uma ação, é "task". Se for informação, é "note".

### 2. DATA DE VENCIMENTO
Se houver menção temporal (ex: "amanhã", "sexta", "semana que vem"), calcule a data ISO 8601.

### 4. STATUS (Estado da Tarefa)
Analise se a ação já foi feita ou está em andamento:
- **pending** (Padrão): "preciso fazer", "vou comprar", "fazer tal coisa"
- **in_progress**: "estou fazendo", "terminando", "comecei a", "em andamento", "fazendo", "vendo", "lendo"
- **done**: "já fiz", "terminei", "concluído", "pago", "comprado", "feito"


## REGRAS DE EXTRAÇÃO DE METAS E CHECKLISTS

### 5. METAS (GOALS)
Se for uma META, defina period_type:
- **daily**: "todo dia", "diariamente", "3x por dia", "beber agua hoje"
- **weekly**: "semana", "semanal", "3x na semana"
- **monthly**: "mês", "mensal"

### 6. CHECKLISTS / SUB-ITENS
Se a tarefa tiver múltiplos itens (ex: "comprar: leite, ovos, pão"), crie um checklist.
ARRAY de objetos: [{ "text": "item desc", "done": false }]

## RESPOSTA (apenas JSON válido):
{
  "_thought_process": "análise detalhada...",
  "category_slug": "home|work|uni|ideas",
  "entry_type": "task|note|insight|bookmark|goal",
  "status": "pending|in_progress|done",
  "metadata": {
    "summary": "resumo curto",
    "tags": ["tag1", "tag2"],
    "emoji": "🎯",
    "target": null,
    "unit": null,
    "period_type": "daily|weekly|monthly|null",
    "due_date": null,
    "priority": "low|medium|high|urgent|null",
    "checklist": [{ "text": "item 1", "done": false }]
  }
}

Texto para analisar: "${content}"
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
