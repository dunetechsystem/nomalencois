/**
 * Conteúdo editável do site — o que não vem do DunasTour (passeios, preços, fotos e contato vêm
 * da API; ver lib/dunastour). Troque à vontade sem mexer nos componentes.
 */
export const site = {
  name: "NOMA",
  legalSuffix: "Agência de Turismo",
  tagline: "Bem-vindo ao Maranhão real",
  city: "Barreirinhas · MA · Brasil",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  /**
   * Usados se a API não devolver telefone/Instagram da agência (ex.: enquanto a NOMA ainda não está
   * cadastrada no DunasTour). TODO: confirmar o WhatsApp oficial da NOMA.
   */
  fallbackWhatsapp: "+55 (98) 90000-0000",
  fallbackInstagram: "nomalencois",
  /** Vazio = esconde o ícone do TikTok. */
  tiktok: "",

  /**
   * Vídeo de fundo do hero (opcional). Coloque um .mp4 leve (até ~8 MB, sem áudio) em
   * /public/videos e aponte aqui, ex.: "/videos/hero.mp4". Vazio = slideshow com as fotos dos passeios.
   */
  heroVideo: "",

  /**
   * Compra pelo site (carrinho, checkout e termo de risco via DunasTour). Desligado = cada passeio
   * mostra só "Verificar disponibilidade", que abre o WhatsApp com o nome do passeio. true pra religar.
   */
  onlineBooking: false,

  /**
   * Carrinho ("Meu roteiro") sem o checkout: o cliente junta vários passeios com data e pessoas e,
   * ao finalizar, o roteiro inteiro vai pro WhatsApp da agência. Ignorado se onlineBooking estiver ligado.
   */
  cart: true,

  /**
   * Reels do Instagram mostrados na seção "No Instagram". Cole a URL do reel/post
   * (ex.: "https://www.instagram.com/reel/C9xYz123AbC/"). Vazio = a seção mostra a grade de fotos com
   * link pro perfil.
   */
  instagramReels: [] as string[],

  /**
   * Vídeos próprios em formato vertical (estilo stories) — arquivos em /public/videos.
   * Vídeos cadastrados na agência no DunasTour (mapa de roteiros) entram automaticamente também.
   */
  videos: [] as { src: string; poster?: string; title: string }[],

  /** Manifesto (post de lançamento "Hoje nasce a NOMA"). */
  manifesto:
    "Mais do que vender viagens, queremos realizar sonhos. A NOMA nasce do encontro entre quem é daqui e quem chega: um jeito de viver os Lençóis com calma, conexão e cuidado em cada detalhe.",

  /**
   * Mini-feed da seção "No Instagram" enquanto não há fotos/reels: os posts da NOMA em blocos de cor.
   * tone: lagoa | buriti | areia | mata | por-do-sol | noite
   */
  feedPosts: [
    { tone: "noite", title: "Mirar das estrelas", kicker: "Experiência NOMA" },
    { tone: "buriti", title: "Lagoa Azul ou Lagoa Bonita?", kicker: "Lençóis" },
    { tone: "lagoa", title: "Relatos de quem viveu os Lençóis com a NOMA", kicker: "Depoimentos" },
    { tone: "por-do-sol", title: "Gosto de lembrar que a vida pode ser mais.", kicker: "Manifesto" },
    { tone: "areia", title: "Circuito Caburé", kicker: "Roteiro" },
    { tone: "mata", title: "Reunimos nossa equipe pra responder algumas perguntas", kicker: "Bastidores" },
  ],

  /** Faixa animada de destinos abaixo do hero. */
  destinations: [
    "Lagoa Bonita",
    "Lagoa Azul",
    "Circuito Caburé",
    "Rio Preguiças",
    "Atins",
    "Vassouras",
    "Mandacaru",
    "Santo Amaro",
    "Mirar das estrelas",
    "Pôr do sol nas dunas",
  ],

  /**
   * Experiências NOMA — cada uma vira um card na cor de um post do feed.
   * tone: lagoa | buriti | areia | mata | por-do-sol | noite
   */
  services: [
    { icon: "mountain", tone: "lagoa", title: "Lagoas & dunas", text: "Lagoa Azul ou Lagoa Bonita? Os circuitos clássicos dos Lençóis, no tempo certo de cada lagoa." },
    { icon: "stars", tone: "noite", title: "Mirar das estrelas", text: "Experiência NOMA: conexão, natureza e exclusividade sob o céu mais limpo do Maranhão." },
    { icon: "route", tone: "buriti", title: "Circuito Caburé", text: "Rio Preguiças, Vassouras, Mandacaru e o farol — o Maranhão real, de barco." },
    { icon: "car", tone: "areia", title: "Transfer & 4x4", text: "Traslados de São Luís, Atins e Santo Amaro com conforto e quem conhece a estrada." },
    { icon: "sparkles", tone: "por-do-sol", title: "Roteiros sob medida", text: "Quantos dias, quais lagoas e em que ritmo: a viagem é montada em volta de você." },
    { icon: "trekking", tone: "mata", title: "Trekking & aventura", text: "Atravessar os Lençóis a pé, quadriciclo e caminhos que pouca gente faz." },
  ],

  faqs: [
    {
      question: "Quem é a NOMA?",
      answer:
        "Uma agência de turismo dos Lençóis Maranhenses feita por gente daqui. Nosso jeito é simples: grupos cuidados de perto, roteiros sem pressa e o Maranhão real — das lagoas ao céu estrelado.",
    },
    {
      question: "Como funciona a reserva?",
      answer:
        "Escolha o passeio, a data e quantas pessoas vão e adicione ao seu roteiro (o carrinho no topo da página). Dá pra juntar vários passeios numa reserva só. Ao finalizar, a conversa abre no WhatsApp com o roteiro já escrito — a NOMA confirma as vagas e combina o pagamento com você por lá.",
    },
    {
      question: "Qual a melhor época para visitar os Lençóis?",
      answer:
        "As lagoas ficam mais cheias entre junho e setembro, depois da temporada de chuvas. De outubro a dezembro ainda é possível banho em várias lagoas — o gráfico de nível das lagoas aqui no site mostra mês a mês.",
    },
    {
      question: "Vocês buscam no hotel?",
      answer:
        "Sim! Na reserva você informa o endereço da sua pousada ou hotel em Barreirinhas e o embarque é feito lá, no veículo 4x4.",
    },
    {
      question: "Criança paga?",
      answer:
        "Crianças de colo (menores de 2 anos) não pagam nos passeios comuns — é só informar na reserva. Passeios de aventura, como quadriciclo, não levam criança de colo.",
    },
    {
      question: "Preciso levar o quê?",
      answer:
        "Protetor solar, óculos de sol, chapéu ou boné, roupa de banho, água e uma sacola pra proteger o celular da areia. Cada passeio mostra mais detalhes.",
    },
    {
      question: "Dá pra montar um roteiro personalizado?",
      answer:
        "Claro. Fale com a gente no WhatsApp contando quantos dias você tem e o que quer viver — montamos o roteiro ideal pra você.",
    },
  ],
};

export type SiteConfig = typeof site;
