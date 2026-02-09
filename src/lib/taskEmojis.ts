/**
 * Sistema de emojis automáticos para tarefas
 * Detecta palavras-chave no conteúdo e retorna emoji apropriado
 */

type EmojiCategory = 'home' | 'work' | 'uni' | 'default'

interface EmojiMapping {
  keywords: string[]
  emoji: string
}

const emojiMappings: EmojiMapping[] = [
  // Trabalho / Reuniões
  { keywords: ['reunião', 'reuniao', 'meeting', 'call', 'chamada'], emoji: '📅' },
  { keywords: ['email', 'e-mail', 'mensagem'], emoji: '📧' },
  { keywords: ['relatório', 'relatorio', 'report'], emoji: '📊' },
  { keywords: ['apresentação', 'apresentacao', 'slides', 'powerpoint'], emoji: '🎯' },
  { keywords: ['deadline', 'prazo', 'entrega'], emoji: '⏰' },
  { keywords: ['cliente', 'client'], emoji: '🤝' },
  { keywords: ['projeto', 'project'], emoji: '📁' },
  
  // Casa / Doméstico
  { keywords: ['limpar', 'limpeza', 'faxina', 'organizar'], emoji: '🧹' },
  { keywords: ['cozinhar', 'comida', 'almoço', 'jantar', 'café'], emoji: '🍳' },
  { keywords: ['comprar', 'compras', 'mercado', 'supermercado', 'feira'], emoji: '🛒' },
  { keywords: ['lavar', 'roupa', 'louça'], emoji: '🧺' },
  { keywords: ['consertar', 'arrumar', 'manutenção'], emoji: '🔧' },
  { keywords: ['pagar', 'conta', 'boleto'], emoji: '💳' },
  
  // Estudo / Faculdade
  { keywords: ['estudar', 'estudo', 'revisar', 'revisão'], emoji: '📚' },
  { keywords: ['prova', 'teste', 'exame'], emoji: '📝' },
  { keywords: ['trabalho acadêmico', 'tcc', 'monografia', 'artigo'], emoji: '🎓' },
  { keywords: ['aula', 'classe', 'lecture'], emoji: '🏫' },
  { keywords: ['ler', 'leitura', 'livro'], emoji: '📖' },
  { keywords: ['pesquisa', 'research'], emoji: '🔬' },
  
  // Saúde / Bem-estar
  { keywords: ['academia', 'treino', 'exercício', 'exercicio', 'gym'], emoji: '💪' },
  { keywords: ['médico', 'medico', 'consulta', 'dentista'], emoji: '🏥' },
  { keywords: ['remédio', 'remedio', 'medicamento'], emoji: '💊' },
  { keywords: ['yoga', 'meditação', 'meditacao', 'relaxar'], emoji: '🧘' },
  { keywords: ['correr', 'corrida', 'caminhada'], emoji: '🏃' },
  
  // Social / Lazer
  { keywords: ['aniversário', 'aniversario', 'festa', 'comemorar'], emoji: '🎂' },
  { keywords: ['viagem', 'viajar', 'trip'], emoji: '✈️' },
  { keywords: ['filme', 'cinema', 'assistir'], emoji: '🎬' },
  { keywords: ['amigo', 'amigos', 'encontro'], emoji: '👥' },
  { keywords: ['presente', 'gift'], emoji: '🎁' },
  
  // Tecnologia / Dev
  { keywords: ['código', 'codigo', 'programar', 'dev', 'bug'], emoji: '💻' },
  { keywords: ['deploy', 'publicar', 'release'], emoji: '🚀' },
  { keywords: ['teste', 'testing', 'qa'], emoji: '🧪' },
  
  // Finanças
  { keywords: ['investir', 'investimento', 'poupança'], emoji: '📈' },
  { keywords: ['orçamento', 'orcamento', 'budget'], emoji: '💰' },
  
  // Pets
  { keywords: ['cachorro', 'dog', 'passeio pet'], emoji: '🐕' },
  { keywords: ['gato', 'cat'], emoji: '🐈' },
  { keywords: ['veterinário', 'veterinario', 'vet'], emoji: '🐾' },
]

// Fallback emojis por categoria
const categoryEmojis: Record<EmojiCategory, string> = {
  home: '🏠',
  work: '💼',
  uni: '🎓',
  default: '📌'
}

/**
 * Encontra o emoji mais apropriado para uma tarefa baseado no conteúdo
 */
export function getTaskEmoji(content: string, categorySlug?: string): string {
  const lowerContent = content.toLowerCase()
  
  // Procura por palavras-chave no conteúdo
  for (const mapping of emojiMappings) {
    for (const keyword of mapping.keywords) {
      if (lowerContent.includes(keyword)) {
        return mapping.emoji
      }
    }
  }
  
  // Fallback para emoji da categoria
  if (categorySlug && categorySlug in categoryEmojis) {
    return categoryEmojis[categorySlug as EmojiCategory]
  }
  
  return categoryEmojis.default
}

/**
 * Retorna cor de fundo suave para o emoji baseado na categoria
 */
export function getEmojiBackground(categorySlug?: string): string {
  switch (categorySlug) {
    case 'home':
      return 'bg-amber-100'
    case 'work':
      return 'bg-blue-100'
    case 'uni':
      return 'bg-emerald-100'
    default:
      return 'bg-slate-100'
  }
}
