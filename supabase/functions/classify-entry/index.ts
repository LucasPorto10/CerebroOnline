// Setup type definitions for Supabase Edge Runtime
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
// @ts-ignore - Deno remote import
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@^0.21.0"

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
        if (!GEMINI_API_KEY) {
            console.error("Error: GEMINI_API_KEY is missing")
            throw new Error('Missing GEMINI_API_KEY environment variable')
        }

        // Initialize the GoogleGenerativeAI client
        const ai = new GoogleGenerativeAI(GEMINI_API_KEY)
        
        const { content } = await req.json()

        if (!content) {
            throw new Error('Content is required')
        }

        const prompt = `
ROLE: You are an intelligent personal assistant for the MindSync app.
GOAL: Analyze the user's input text and classify it into specific categories and types for organization.

CATEGORIES (Mutually Exclusive):
- 'home': Household tasks, chores, shopping lists, family matters, maintenance.
- 'work': Professional tasks, meetings, emails, career planning, projects.
- 'uni': Academic study, courses, assignments, learning new skills.
- 'ideas': Creative thoughts, brainstorming, random musings, potential projects, dreams.

TYPES:
- 'task': Actionable items with a clear objective (e.g., "Buy milk", "Email John").
- 'note': Information to remember, reference material (e.g., "The door code is 1234").
- 'insight': Deep realizations, lessons learned (e.g., "I realized I work better in the morning").
- 'bookmark': URLs, book recommendations, movies to watch (e.g., "Check out this website...").

INSTRUCTIONS:
1. Analyze the context and intent of the input TEXT.
2. Select the BEST fitting 'category_slug' and 'entry_type' from the lists above.
3. Generate a short, action-oriented 'summary' (max 6 words).
4. Extract up to 3 relevant 'tags' (lowercase).
5. Choose a SINGLE emoji that BEST represents this specific task/note. BE CREATIVE AND SPECIFIC!
   - RULE: Prioritize specific OBJECTS over generic actions.
   - CHAIN OF THOUGHT (Perform this internally):
     1. Identify the specific noun/object (e.g., "cobertores", "roupas", "pipoca").
     2. Visualise the object.
     3. Select an emoji that looks like that object.
   - EXAMPLES (Do vs Don't):
     - "Lavar cobertores" -> 🛌 (Bed/Blanket) OR ❄️ (Cold/Comfy) -> NOT 🧺 (Laundry basket is too generic).
     - "Estender roupas" -> � (Shirt) OR 👗 (Dress) -> NOT 🧺.
     - "Comprar leite" -> 🥛 (Milk) -> NOT 🛒 (Cart is generic).
     - "Pagar internet" -> 🌐 (Globe) or 💻 (Laptop) -> NOT 💰 (Money is generic).
     - "Ir na academia" -> 🏋️ (Weightlifter) -> NOT 🏃 (Running is generic if lifting weights).
   - ONLY use generic emojis (✅, 📝, 🧺, 🛒) if there is NO specific object mentioned.
6. RETURN ONLY RAW JSON. Do not include markdown formatting, explanations, or chatter.

OUTPUT FORMAT:
{
  "_thought_process": "Brief reasoning here (e.g., 'User wants to wash blankets. Blankets are related to beds. Best emoji is bed.')",
  "category_slug": "home" | "work" | "uni" | "ideas",
  "entry_type": "task" | "note" | "insight" | "bookmark",
  "metadata": {
    "summary": "Short summary here",
    "tags": ["tag1", "tag2"],
    "emoji": "SPECIFIC_EMOJI"
  }
}

Text: "${content}"
`

        // Call the Gemini API. Using gemini-1.5-pro for best reasoning capabilities
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-pro' })
        const generationResult = await model.generateContent(prompt)
        const response = await generationResult.response
        const textResponse = response.text()

        // Parse the JSON response (clean up markdown if present)
        const jsonMatch = textResponse?.match(/\{[\s\S]*\}/)
        const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { category_slug: 'ideas', entry_type: 'note' }

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        console.error("Edge Function Error:", error)
        // Log stack trace if available
        if (error instanceof Error && error.stack) {
            console.error(error.stack);
        }
        
        const message = error instanceof Error ? error.message : 'Unknown error'
        const errorDetails = error instanceof Error ? { message: error.message, stack: error.stack, name: error.name } : { message: String(error) };

        return new Response(JSON.stringify({ error: message, details: errorDetails }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
