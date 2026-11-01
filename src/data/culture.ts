/**
 * Base de conhecimento: vitolas, cortes, acendimento, anatomia e curiosidades.
 */
import { AnatomyPart, Curiosity, CutType, LightingMethod, Vitola } from '../types';

/**
 * Vitolas de galera (formatos). Cepo = ring gauge, medido em 1/64 de polegada.
 * Tempos de queima são estimativas para fumada tranquila (~1 baforada/min).
 */
export const VITOLAS: Vitola[] = [
  {
    id: 'petit-corona',
    name: 'Petit Corona',
    shape: 'parejo',
    ringGauge: 42,
    lengthMm: 129,
    lengthIn: '5"',
    smokeTimeMin: [30, 40],
    description: 'Compacto e direto. Revela o blend com rapidez e intensidade de sabor surpreendente para o tamanho.',
    occasion: 'Pausa após o almoço ou um espresso no meio da tarde.',
    pairingIds: ['espresso', 'porto-tawny'],
  },
  {
    id: 'corona',
    name: 'Corona',
    shape: 'parejo',
    ringGauge: 42,
    lengthMm: 142,
    lengthIn: '5⅝"',
    smokeTimeMin: [40, 55],
    description: 'O formato de referência clássico. Proporção ideal entre capa e tripa — muitos puristas o consideram o mais equilibrado.',
    occasion: 'Fim de tarde, conversa sem pressa.',
    pairingIds: ['espresso', 'whisky-speyside', 'rum-agricole'],
  },
  {
    id: 'robusto',
    name: 'Robusto',
    shape: 'parejo',
    ringGauge: 50,
    lengthMm: 124,
    lengthIn: '4⅞"',
    smokeTimeMin: [45, 60],
    description: 'O formato mais popular do mundo. Curto e encorpado, entrega sabor concentrado com fumaça generosa.',
    occasion: 'Happy hour, primeira experiência ou um intervalo de uma hora.',
    pairingIds: ['whisky-speyside', 'rum-envelhecido', 'espresso'],
  },
  {
    id: 'toro',
    name: 'Toro',
    shape: 'parejo',
    ringGauge: 52,
    lengthMm: 152,
    lengthIn: '6"',
    smokeTimeMin: [60, 80],
    description: 'Versão alongada do robusto, com evolução de sabores mais gradual entre os terços.',
    occasion: 'Jantar entre amigos, após a refeição.',
    pairingIds: ['bourbon', 'cognac-vsop'],
  },
  {
    id: 'torpedo',
    name: 'Torpedo / Pirámide',
    shape: 'figurado',
    ringGauge: 52,
    lengthMm: 156,
    lengthIn: '6⅛"',
    smokeTimeMin: [60, 80],
    description: 'Cabeça cônica que concentra a fumaça no paladar. Exige maestria do torcedor — sinal de charuto de alto nível.',
    occasion: 'Celebrações e degustações dedicadas.',
    pairingIds: ['cognac-xo', 'whisky-islay', 'porto-tawny'],
  },
  {
    id: 'churchill',
    name: 'Churchill',
    shape: 'parejo',
    ringGauge: 47,
    lengthMm: 178,
    lengthIn: '7"',
    smokeTimeMin: [75, 100],
    description: 'Batizado em homenagem a Winston Churchill. Longo e elegante, permite uma jornada completa de sabores.',
    occasion: 'Noite longa, varanda, sem relógio.',
    pairingIds: ['cognac-xo', 'whisky-sherry', 'rum-envelhecido'],
  },
  {
    id: 'gordo',
    name: 'Gordo',
    shape: 'parejo',
    ringGauge: 60,
    lengthMm: 152,
    lengthIn: '6"',
    smokeTimeMin: [80, 110],
    description: 'Cepo largo e queima fria. Popular no Novo Mundo, privilegia a tripa e entrega fumaça densa.',
    occasion: 'Churrasco de domingo, eventos ao ar livre.',
    pairingIds: ['bourbon', 'rum-envelhecido'],
  },
  {
    id: 'panetela',
    name: 'Panetela / Lancero',
    shape: 'parejo',
    ringGauge: 38,
    lengthMm: 192,
    lengthIn: '7½"',
    smokeTimeMin: [50, 70],
    description: 'Fino e longo, dá protagonismo à capa. Queima mais quente — exige ritmo calmo. Favorito de conhecedores.',
    occasion: 'Degustação analítica, para apreciadores experientes.',
    pairingIds: ['espresso', 'whisky-speyside', 'champagne'],
  },
  {
    id: 'perfecto',
    name: 'Perfecto',
    shape: 'figurado',
    ringGauge: 49,
    lengthMm: 115,
    lengthIn: '4½"',
    smokeTimeMin: [40, 60],
    description: 'Afunilado nas duas pontas. Começa intenso, abre no centro e fecha concentrado — uma curva de sabores única.',
    occasion: 'Para surpreender um convidado.',
    pairingIds: ['porto-tawny', 'cognac-vsop'],
  },
];

export const getVitola = (id: string) => VITOLAS.find((v) => v.id === id);

export const CUTS: CutType[] = [
  {
    id: 'guilhotina',
    name: 'Guilhotina',
    icon: 'cut-outline',
    description:
      'Corte reto da capa na cabeça do charuto. Remova apenas 2 a 3 mm, logo acima da linha onde termina o "gorro" (a capinha que fecha a cabeça).',
    pros: ['Tiragem ampla e aberta', 'Funciona em qualquer vitola', 'Clássico e versátil'],
    cons: ['Corte excessivo pode desmanchar a capa'],
    bestFor: 'Todas as vitolas, especialmente torpedos e churchills.',
  },
  {
    id: 'v-cut',
    name: 'Corte em V',
    icon: 'chevron-down-outline',
    description:
      'Faz uma cunha profunda na cabeça, aumentando a superfície de tiragem sem expor demais a tripa.',
    pros: ['Concentra a fumaça no centro da língua', 'Menos fragmentos de tabaco na boca'],
    cons: ['Pouco indicado para cepos finos', 'Lâminas perdem o fio com facilidade'],
    bestFor: 'Robustos e gordos (cepo 50+).',
  },
  {
    id: 'punch',
    name: 'Furador (Punch)',
    icon: 'radio-button-on-outline',
    description:
      'Perfura um pequeno orifício circular na cabeça, preservando a estrutura da capa.',
    pros: ['Preserva a cabeça intacta', 'Prático e de bolso', 'Tiragem mais suave'],
    cons: ['Pode acumular alcatrão no orifício', 'Inadequado para figurados'],
    bestFor: 'Coronas, robustos e parejos de cabeça arredondada.',
  },
];

export const LIGHTING: LightingMethod[] = [
  {
    id: 'cedro',
    name: 'Lascas de cedro (Spills)',
    icon: 'flame-outline',
    verdict: 'recomendado',
    description:
      'A forma mais tradicional e elegante. Acenda uma tira de cedro espanhol e use sua chama suave e aromática para tostar o pé do charuto.',
  },
  {
    id: 'macarico',
    name: 'Isqueiro maçarico (butano)',
    icon: 'bonfire-outline',
    verdict: 'recomendado',
    description:
      'Chama limpa, sem odor e resistente ao vento. Mantenha distância de 1–2 cm e evite carbonizar o tabaco.',
  },
  {
    id: 'fosforo-longo',
    name: 'Fósforo longo de madeira',
    icon: 'remove-outline',
    verdict: 'aceitavel',
    description:
      'Aceitável se você esperar a cabeça de enxofre queimar totalmente antes de aproximar do charuto.',
  },
  {
    id: 'isqueiro-gasolina',
    name: 'Isqueiro a fluido / gasolina',
    icon: 'warning-outline',
    verdict: 'evitar',
    description:
      'Libera odor de combustível que contamina a capa e altera irreversivelmente o sabor.',
  },
  {
    id: 'vela',
    name: 'Velas',
    icon: 'close-circle-outline',
    verdict: 'evitar',
    description: 'Parafina e aromatizantes da vela impregnam o tabaco com fuligem e aromas indesejados.',
  },
];

/** Passo a passo do ritual de acendimento */
export const LIGHTING_STEPS = [
  { title: 'Tostar', text: 'Segure o charuto a 45° sobre a chama, sem tocar, girando até o pé ficar uniformemente tostado.' },
  { title: 'Acender', text: 'Leve o charuto à boca e aspire suavemente enquanto gira, aproximando da chama.' },
  { title: 'Soprar', text: 'Dê um leve sopro de volta pelo charuto para expulsar gases amargos da primeira combustão.' },
  { title: 'Conferir', text: 'Observe a brasa: ela deve formar um anel completo e uniforme.' },
];

export const ANATOMY: AnatomyPart[] = [
  {
    id: 'capa',
    name: 'Capa',
    subtitle: 'Wrapper',
    description:
      'A folha externa — a "roupa" do charuto. Responde por até 60% do sabor e por todo o apelo visual. Cultivada geralmente sob tela (tapado) para ficar fina, elástica e sem nervuras salientes.',
    details: [
      { name: 'Claro', text: 'Bege-claro, suave e sedosa (ex.: Connecticut Shade).' },
      { name: 'Colorado', text: 'Avermelhada, aromática e equilibrada.' },
      { name: 'Maduro', text: 'Marrom-escura, doce e encorpada, com longa fermentação.' },
      { name: 'Oscuro', text: 'Quase negra, intensa, notas de cacau e café.' },
    ],
  },
  {
    id: 'capote',
    name: 'Capote',
    subtitle: 'Binder',
    description:
      'Folha que envolve e mantém a tripa unida, garantindo a estrutura e a combustão uniforme. Normalmente vem das folhas mais resistentes da parte média da planta.',
  },
  {
    id: 'tripa',
    name: 'Tripa (Miolo)',
    subtitle: 'Filler',
    description:
      'O coração do charuto: o blend de folhas inteiras dobradas em "livro". A proporção entre os três tipos de folha define força e sabor.',
    details: [
      { name: 'Volado', text: 'Folhas da base da planta. Pouco sabor, mas essenciais para a boa combustão.' },
      { name: 'Seco', text: 'Folhas do meio. Aroma e equilíbrio — a "alma" do blend.' },
      { name: 'Ligero', text: 'Folhas do topo, mais expostas ao sol. Força, óleos e intensidade; queimam devagar e ficam no centro.' },
    ],
  },
  {
    id: 'cabeca',
    name: 'Cabeça',
    subtitle: 'Head',
    description: 'Extremidade fechada que vai à boca, finalizada com o gorro (cap). É ali que se faz o corte.',
  },
  {
    id: 'pe',
    name: 'Pé',
    subtitle: 'Foot',
    description: 'Extremidade aberta onde se acende o charuto. Revela o blend da tripa em camadas.',
  },
  {
    id: 'anilha',
    name: 'Anilha',
    subtitle: 'Band',
    description:
      'Selo de identidade da marca. Pode ser removida após o primeiro terço, quando a cola já aqueceu e se solta sem rasgar a capa.',
  },
];

export const CURIOSITIES: Curiosity[] = [
  {
    id: 'anilha-origem',
    title: 'Por que os charutos têm anilha?',
    category: 'historia',
    summary: 'De luvas improvisadas a obras de arte litográficas.',
    body:
      'Uma lenda atribui a anilha à Catarina, a Grande, que envolvia os charutos com seda para não manchar os dedos. Historicamente, porém, foi o holandês Gustave Bock, por volta de 1850, quem adotou anilhas para diferenciar seus Habanos das falsificações. No fim do século XIX, as anilhas litografadas viraram objeto de colecionador — a "vitolfilia".',
  },
  {
    id: 'lector',
    title: 'O leitor das fábricas',
    category: 'historia',
    summary: 'Romances lidos em voz alta para os torcedores.',
    body:
      'Desde 1865, as fábricas cubanas mantêm o "lector de tabaquería", que lê jornais e romances para os torcedores durante o trabalho. Obras como "O Conde de Monte Cristo" e "Romeu e Julieta" inspiraram nomes de marcas lendárias. Em 2012, a leitura de tabaquería foi declarada Patrimônio Cultural da Nação Cubana.',
  },
  {
    id: 'casa-de-cura',
    title: 'Casas de cura (curing barns)',
    category: 'cultivo',
    summary: 'Onde a folha verde vira ouro castanho.',
    body:
      'Após a colheita, as folhas são penduradas em varas nas casas de cura — galpões de madeira orientados de leste a oeste para controlar sol e ventilação. Durante 45 a 60 dias, a clorofila se decompõe e a folha passa do verde ao castanho-dourado. Portas e janelas são abertas ou fechadas conforme a umidade do dia.',
  },
  {
    id: 'fermentacao',
    title: 'Fermentação e envelhecimento',
    category: 'cultivo',
    summary: 'Pilones que chegam a 45 °C.',
    body:
      'As folhas curadas são empilhadas em "pilones" de até 2 metros. A umidade e o peso geram calor natural (até 45 °C), que elimina amônia, nicotina em excesso e impurezas. Os pilones são desmontados e remontados várias vezes ao longo de meses. Depois, o tabaco ainda envelhece em fardos por 1 a 5 anos.',
  },
  {
    id: 'cinza',
    title: 'Não bata a cinza',
    category: 'etiqueta',
    summary: 'Uma cinza longa é sinal de bom enrolamento.',
    body:
      'A cinza protege a brasa e ajuda a manter a temperatura de queima. Deixe-a cair naturalmente no cinzeiro, apenas encostando o charuto na borda. Uma cinza firme de 2–3 cm indica tripa bem distribuída e tabaco de qualidade.',
  },
  {
    id: 'apagar',
    title: 'Como apagar um charuto',
    category: 'etiqueta',
    summary: 'Nunca esmague: deixe-o repousar.',
    body:
      'Ao terminar, simplesmente deixe o charuto no cinzeiro — ele se apagará sozinho em poucos minutos com dignidade. Esmagá-lo libera odores fortes e é considerado deselegante entre apreciadores.',
  },
  {
    id: 'umidade',
    title: 'A regra 70/70',
    category: 'ritual',
    summary: 'O equilíbrio perfeito de um umidor.',
    body:
      'Charutos devem ser armazenados a cerca de 70% de umidade relativa e 21 °C (70 °F). Abaixo disso a capa resseca e racha; acima, o charuto queima mal e pode mofar ou atrair o temido besouro do tabaco (Lasioderma serricorne).',
  },
  {
    id: 'mata-fina',
    title: 'Mata Fina: o tesouro baiano',
    category: 'cultivo',
    summary: 'Um dos tabacos escuros mais respeitados do mundo.',
    body:
      'Cultivado no Recôncavo Baiano, o Mata Fina é um tabaco de sol, escuro e naturalmente adocicado. Por séculos foi exportado para a Europa e ainda hoje integra blends de casas alemãs, suíças e dominicanas.',
  },
];
