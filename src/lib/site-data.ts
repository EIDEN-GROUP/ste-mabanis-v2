import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import property4 from "@/assets/property-4.jpg";
import property5 from "@/assets/property-5.jpg";
import property6 from "@/assets/property-6.jpg";
import locationAgadir from "@/assets/location-agadir.jpg";
import locationTaghazout from "@/assets/location-taghazout.jpg";
import testimonialsImage from "@/assets/testimonials.png";
import locationMarina from "@/assets/location-marina.jpg";
import CtaMarina from "@/assets/morocco agadir.png";
import locationFounty from "@/assets/location-founty.jpg";
import editorial1 from "@/assets/editorial-1.jpg";
import teamOffice from "@/assets/team-office.jpg";
import heroAgadir from "@/assets/hero-agadir.jpg";
import officeMandat from "@/assets/office-mandat.jpg";
import agenceImage from "@/assets/testimonials.png";

export const images = {
  property1,
  property2,
  property3,
  property4,
  property5,
  property6,
  locationAgadir,
  locationTaghazout,
  testimonialsImage,
  locationMarina,
  CtaMarina,
  locationFounty,
  editorial1,
  teamOffice,
  heroAgadir,
  officeMandat,
  agenceImage,
};

export const agency = {
  name: "STE MABANIS",
  legalName: "STE Gestion et Services MABANIS",
  tagline: "Ste Gestion et Services",
  activity: "Agence immobilière, services et conseil",
  /** Both public numbers are mobiles; the first one also carries WhatsApp. */
  phone: "+212 662 64 51 79",
  mobile: "+212 620 22 60 50",
  whatsapp: "212662645179",
  email: "contact@mabanis.au",
  address: "Imm. 13, Magasin N°03, Come Miftah Sahel, Anza – Agadir",
  area: "Anza, Agadir",
  city: "Agadir, Souss-Massa, Maroc",
  legalForm: "SARL à associé unique",
  capital: "50 000 MAD",
  /** Kept at neighbourhood level: the street line does not geocode reliably. */
  mapQuery: "Anza, Agadir, Maroc",
  hours: "Lundi – Vendredi : 9h – 18h30 · Samedi : 9h – 13h",
};

/** The agency's live accounts. Share-sheet tracking params stripped. */
export const socials = [
  { label: "Instagram", href: "https://www.instagram.com/stemabanis" },
  { label: "Threads", href: "https://www.threads.com/@stemabanis" },
  { label: "Facebook", href: "https://www.facebook.com/546734788522803" },
] as const;

export type Transaction = "vente" | "location";

export type Property = {
  slug: string;
  reference: string;
  title: string;
  transaction: Transaction;
  type: string;
  city: string;
  neighborhood: string;
  locationSlug: string;
  price: number;
  priceNote?: string;
  surface: number;
  landSurface?: number;
  bedrooms: number;
  bathrooms: number;
  year: number;
  description: string[];
  features: string[];
  images: string[];
  agentSlug: string;
  featured?: boolean;
  isNew?: boolean;
  mapQuery: string;
};

export const properties: Property[] = [
  {
    slug: "villa-contemporaine-founty-piscine",
    reference: "MB-1042",
    title: "Villa contemporaine avec piscine, Founty",
    transaction: "vente",
    type: "Villa",
    city: "Agadir",
    neighborhood: "Founty – Cité Balnéaire",
    locationSlug: "founty",
    price: 6850000,
    surface: 420,
    landSurface: 780,
    bedrooms: 5,
    bathrooms: 4,
    year: 2021,
    description: [
      "À dix minutes à pied de la plage de Founty, cette villa d'architecte déploie 420 m² habitables sur un terrain paysager de 780 m². Les volumes sont généreux, orientés plein sud, et s'ouvrent largement sur la piscine à débordement.",
      "Le rez-de-chaussée réunit un double séjour, une cuisine équipée avec arrière-cuisine, une suite d'amis et un patio planté. À l'étage, quatre chambres dont une suite parentale avec dressing et terrasse privative face à l'océan.",
      "Un bien rare dans un quartier résidentiel sécurisé, idéal en résidence principale comme en résidence secondaire haut de gamme.",
    ],
    features: [
      "Piscine à débordement chauffée",
      "Suite parentale avec dressing",
      "Cuisine équipée + arrière-cuisine",
      "Garage double",
      "Jardin paysager et système d'arrosage",
      "Climatisation gainable",
      "Panneaux solaires",
      "Quartier sécurisé 24/7",
    ],
    images: [property1, property2, property6, property4],
    agentSlug: "yassine-el-amrani",
    featured: true,
    mapQuery: "Founty, Agadir, Maroc",
  },
  {
    slug: "appartement-vue-mer-marina-agadir",
    reference: "MB-1088",
    title: "Appartement vue mer, Marina d'Agadir",
    transaction: "vente",
    type: "Appartement",
    city: "Agadir",
    neighborhood: "Marina d'Agadir",
    locationSlug: "marina",
    price: 3200000,
    surface: 168,
    bedrooms: 3,
    bathrooms: 2,
    year: 2019,
    description: [
      "Au quatrième étage d'une résidence de standing de la Marina, cet appartement traversant offre une vue frontale sur le port de plaisance et la baie d'Agadir.",
      "Séjour de 45 m² prolongé par une terrasse de 22 m², trois chambres dont une suite, deux salles d'eau et un parking en sous-sol. La résidence dispose d'une piscine commune, d'une conciergerie et d'un accès direct à la promenade.",
    ],
    features: [
      "Vue frontale sur la marina",
      "Terrasse de 22 m²",
      "Piscine et jardins communs",
      "Conciergerie et gardiennage",
      "Parking en sous-sol",
      "Ascenseur",
      "Cuisine américaine équipée",
    ],
    images: [property2, property3, property6],
    agentSlug: "salma-bouhaddou",
    featured: true,
    isNew: true,
    mapQuery: "Marina Agadir, Maroc",
  },
  {
    slug: "penthouse-terrasse-baie-agadir",
    reference: "MB-1103",
    title: "Penthouse avec terrasse panoramique, Baie d'Agadir",
    transaction: "vente",
    type: "Penthouse",
    city: "Agadir",
    neighborhood: "Secteur Touristique",
    locationSlug: "centre-agadir",
    price: 4450000,
    surface: 210,
    bedrooms: 4,
    bathrooms: 3,
    year: 2022,
    description: [
      "Dernier étage d'une résidence récente, ce penthouse s'organise autour d'une terrasse de 90 m² avec bassin et coin lounge, ouverte sur la baie et les lumières de la ville.",
      "Prestations soignées : menuiseries aluminium à rupture de pont thermique, sols en marbre, domotique d'éclairage, cuisine sur mesure.",
    ],
    features: [
      "Terrasse de 90 m² avec bassin",
      "Vue mer et ville à 180°",
      "Domotique éclairage",
      "Sols marbre",
      "Deux places de parking",
      "Local de rangement",
    ],
    images: [property6, property2, property3],
    agentSlug: "yassine-el-amrani",
    featured: true,
    mapQuery: "Secteur Touristique, Agadir, Maroc",
  },
  {
    slug: "riad-renove-medina-agadir",
    reference: "MB-0974",
    title: "Riad rénové avec patio, Médina d'Agadir",
    transaction: "vente",
    type: "Riad",
    city: "Agadir",
    neighborhood: "Médina – Ben Sergao",
    locationSlug: "centre-agadir",
    price: 2380000,
    surface: 260,
    landSurface: 300,
    bedrooms: 4,
    bathrooms: 3,
    year: 1998,
    description: [
      "Un riad entièrement restauré dans le respect des savoir-faire locaux : zellige posé à la main, tadelakt, boiseries de cèdre. Le patio central, planté d'agrumes, distribue les pièces de vie.",
      "Idéal pour un projet de maison d'hôtes ou une résidence de caractère à quelques minutes du centre.",
    ],
    features: [
      "Patio central avec fontaine",
      "Zellige et tadelakt d'origine",
      "Terrasse solarium",
      "Hammam privatif",
      "Rénovation complète 2020",
    ],
    images: [property4, property5, property1],
    agentSlug: "karim-ouhssaine",
    mapQuery: "Médina, Agadir, Maroc",
  },
  {
    slug: "duplex-familial-hay-mohammadi",
    reference: "MB-1120",
    title: "Duplex familial lumineux, Hay Mohammadi",
    transaction: "location",
    type: "Duplex",
    city: "Agadir",
    neighborhood: "Hay Mohammadi",
    locationSlug: "hay-mohammadi",
    price: 11500,
    priceNote: "par mois, charges comprises",
    surface: 145,
    bedrooms: 3,
    bathrooms: 2,
    year: 2017,
    description: [
      "Duplex traversant dans une petite copropriété calme, à proximité immédiate des écoles, commerces et de la voie express.",
      "Loué meublé, avec cuisine équipée, salon double hauteur et deux terrasses. Une adresse idéale pour une famille ou un séjour longue durée.",
    ],
    features: [
      "Meublé et équipé",
      "Deux terrasses",
      "Place de parking privative",
      "Interphone vidéo",
      "Proche écoles et commerces",
    ],
    images: [property5, property2, property4],
    agentSlug: "salma-bouhaddou",
    isNew: true,
    mapQuery: "Hay Mohammadi, Agadir, Maroc",
  },
  {
    slug: "appartement-meuble-marina-location",
    reference: "MB-1131",
    title: "Appartement meublé face au port, Marina",
    transaction: "location",
    type: "Appartement",
    city: "Agadir",
    neighborhood: "Marina d'Agadir",
    locationSlug: "marina",
    price: 16000,
    priceNote: "par mois",
    surface: 120,
    bedrooms: 2,
    bathrooms: 2,
    year: 2020,
    description: [
      "Location longue durée dans la résidence la plus recherchée de la Marina. Appartement entièrement meublé par un architecte d'intérieur, avec accès piscine et conciergerie.",
    ],
    features: [
      "Vue port de plaisance",
      "Accès piscine et salle de sport",
      "Conciergerie",
      "Meublé haut de gamme",
      "Parking sécurisé",
    ],
    images: [property3, property2, property6],
    agentSlug: "karim-ouhssaine",
    featured: true,
    mapQuery: "Marina Agadir, Maroc",
  },
  {
    slug: "villa-front-ocean-taghazout",
    reference: "MB-1055",
    title: "Villa front d'océan, Taghazout Bay",
    transaction: "vente",
    type: "Villa",
    city: "Taghazout",
    neighborhood: "Taghazout Bay",
    locationSlug: "taghazout",
    price: 9600000,
    surface: 380,
    landSurface: 1100,
    bedrooms: 4,
    bathrooms: 4,
    year: 2023,
    description: [
      "Sur les hauteurs de Taghazout Bay, une villa neuve posée face à l'Atlantique, livrée avec piscine à débordement et accès direct au parcours de golf.",
      "Un projet signé par un cabinet d'architecture casablancais, pensé pour les couchers de soleil et la lumière rasante de fin de journée.",
    ],
    features: [
      "Front d'océan",
      "Piscine à débordement",
      "Accès golf et resort",
      "Livrée neuve, garantie décennale",
      "Éligible statut résident non-résident",
    ],
    images: [property1, property6, property2],
    agentSlug: "yassine-el-amrani",
    isNew: true,
    mapQuery: "Taghazout Bay, Maroc",
  },
  {
    slug: "plateau-bureaux-centre-agadir",
    reference: "MB-1067",
    title: "Plateau de bureaux, Avenue Hassan II",
    transaction: "location",
    type: "Bureau",
    city: "Agadir",
    neighborhood: "Centre-ville",
    locationSlug: "centre-agadir",
    price: 24000,
    priceNote: "par mois, HT",
    surface: 240,
    bedrooms: 0,
    bathrooms: 2,
    year: 2015,
    description: [
      "Plateau de 240 m² en étage élevé sur l'artère la plus visible d'Agadir. Livré cloisonné en six bureaux, salle de réunion et espace d'accueil.",
      "Idéal pour un cabinet, une agence ou une antenne régionale. Possibilité d'aménagement sur mesure avant entrée dans les lieux.",
    ],
    features: [
      "Façade sur avenue Hassan II",
      "Six bureaux + salle de réunion",
      "Climatisation centralisée",
      "Fibre optique",
      "Parking visiteurs",
    ],
    images: [property2, property5, property3],
    agentSlug: "karim-ouhssaine",
    mapQuery: "Avenue Hassan II, Agadir, Maroc",
  },
];

export const propertyTypes = [
  "Villa",
  "Appartement",
  "Penthouse",
  "Duplex",
  "Riad",
  "Bureau",
];

export type Agent = {
  slug: string;
  name: string;
  role: string;
  initials: string;
  /** Portrait for the team rail; the monogram stands in until there is one. */
  photo?: string;
  expertise: string;
  bio: string;
  phone: string;
  email: string;
  languages: string;
  years: number;
};

export const agents: Agent[] = [
  {
    slug: "yassine-el-amrani",
    name: "Yassine El Amrani",
    role: "Directeur associé · Prestige & Investissement",
    initials: "YE",
    expertise: "Villas de prestige, front de mer, investissement locatif",
    bio: "Yassine accompagne depuis quinze ans des acquéreurs marocains et européens sur le littoral d'Agadir. Il a piloté la commercialisation de plus de 120 villas et connaît chaque rue de Founty et de Taghazout Bay.",
    phone: "+212 661 24 78 35",
    email: "y.elamrani@mabanis.au",
    languages: "Français · Arabe · Anglais · Amazigh",
    years: 15,
  },
  {
    slug: "salma-bouhaddou",
    name: "Salma Bouhaddou",
    role: "Conseillère senior · Résidentiel & Familles",
    initials: "SB",
    expertise: "Appartements familiaux, primo-accédants, location longue durée",
    bio: "Salma s'occupe des familles qui s'installent à Agadir : écoles, quartiers, budgets, démarches administratives. Elle est reconnue pour sa franchise et pour des visites toujours préparées au détail près.",
    phone: "+212 662 55 41 07",
    email: "s.bouhaddou@mabanis.au",
    languages: "Français · Arabe · Espagnol",
    years: 9,
  },
  {
    slug: "karim-ouhssaine",
    name: "Karim Ouhssaine",
    role: "Responsable gestion locative & commerce",
    initials: "KO",
    expertise: "Gestion locative, bureaux et locaux commerciaux, rendement",
    bio: "Karim gère aujourd'hui un portefeuille de plus de 180 lots pour le compte de propriétaires résidents et non-résidents. Encaissements, entretien, fiscalité locale : il tient les dossiers avec une rigueur d'expert-comptable.",
    phone: "+212 663 18 92 44",
    email: "k.ouhssaine@mabanis.au",
    languages: "Français · Arabe · Anglais",
    years: 12,
  },
  {
    slug: "nadia-lahlou",
    name: "Nadia Lahlou",
    role: "Expertise & évaluation immobilière",
    initials: "NL",
    expertise: "Estimations, expertise valeur vénale, conseil aux vendeurs",
    bio: "Nadia produit les estimations de l'agence à partir des transactions réellement signées sur le Grand Agadir. Son rapport d'évaluation est devenu la référence pour nos vendeurs et leurs banques.",
    phone: "+212 665 70 33 21",
    email: "n.lahlou@mabanis.au",
    languages: "Français · Arabe",
    years: 11,
  },
];

export type Location = {
  slug: string;
  name: string;
  city: string;
  image: string;
  intro: string;
  editorial: string[];
  lifestyle: string[];
  investment: string;
  priceRange: string;
};

export const locations: Location[] = [
  {
    slug: "founty",
    name: "Founty – Cité Balnéaire",
    city: "Agadir",
    image: locationFounty,
    intro:
      "Le quartier résidentiel le plus recherché d'Agadir : villas basses, rues plantées de bougainvillées, plage à pied.",
    editorial: [
      "Founty s'est construit lentement, à l'écart de la densité du centre. On y trouve encore des parcelles de 800 m² et des villas des années 90 que les nouveaux propriétaires transforment en maisons contemporaines.",
      "La proximité immédiate de la plage, des hôtels et du golf en fait le secteur préféré des familles installées à l'année comme des acheteurs de résidence secondaire.",
    ],
    lifestyle: [
      "Plage de Founty à 5–10 minutes à pied",
      "Écoles françaises et internationales à proximité",
      "Golf du Soleil et Golf de l'Océan",
      "Restaurants et clubs de plage",
    ],
    investment:
      "Marché de la revente tendu, peu de terrains disponibles. Les villas rénovées se négocient entre 14 000 et 20 000 MAD/m² et se revendent bien.",
    priceRange: "14 000 – 20 000 MAD/m²",
  },
  {
    slug: "marina",
    name: "Marina d'Agadir",
    city: "Agadir",
    image: locationMarina,
    intro:
      "Un front de port piéton, des résidences fermées et une vue qui ne se dévalue pas.",
    editorial: [
      "La Marina reste le programme le plus abouti de la ville : commerces en pied d'immeuble, quais entretenus, sécurité permanente. Les appartements traversants avec vue port sont les plus liquides du marché gadiri.",
      "C'est aussi le secteur qui capte la demande locative saisonnière et longue durée des expatriés et des cadres en mission.",
    ],
    lifestyle: [
      "Promenade piétonne et port de plaisance",
      "Cafés, restaurants et commerces sur les quais",
      "Résidences sécurisées avec piscine",
      "Accès direct à la grande plage",
    ],
    investment:
      "Rendement locatif brut observé entre 5 % et 6,5 % en longue durée. Forte demande locative de septembre à juin.",
    priceRange: "16 000 – 24 000 MAD/m²",
  },
  {
    slug: "taghazout",
    name: "Taghazout & Taghazout Bay",
    city: "Taghazout",
    image: testimonialsImage,
    intro:
      "Le littoral surf devenu destination de villégiature : resorts, golf et villas front d'océan.",
    editorial: [
      "À vingt minutes au nord d'Agadir, Taghazout a changé d'échelle avec la station Taghazout Bay. Le village de pêcheurs a gardé son âme, mais les hauteurs accueillent désormais des programmes haut de gamme et des villas d'architecte.",
      "L'acheteur y vient pour la lumière, les vagues et un cadre encore préservé, avec une gestion locative facile hors saison.",
    ],
    lifestyle: [
      "Spots de surf réputés (Anchor Point, Killer Point)",
      "Golf et resorts internationaux",
      "Restaurants de bord de mer",
      "20 minutes de l'aéroport Agadir Al Massira",
    ],
    investment:
      "Zone en développement continu. Fort potentiel de plus-value sur les biens front d'océan et location saisonnière soutenue.",
    priceRange: "18 000 – 28 000 MAD/m²",
  },
  {
    slug: "hay-mohammadi",
    name: "Hay Mohammadi",
    city: "Agadir",
    image: locationAgadir,
    intro:
      "Le cœur résidentiel de la classe moyenne supérieure : pratique, bien desservi, familial.",
    editorial: [
      "Hay Mohammadi concentre les immeubles récents à taille humaine, les écoles et les commerces du quotidien. C'est le secteur où l'on trouve encore des appartements de 120 à 160 m² à des prix raisonnables.",
      "Un choix de bon sens pour une résidence principale ou un premier investissement locatif.",
    ],
    lifestyle: [
      "Écoles, crèches et cliniques à proximité",
      "Marchés et commerces de quartier",
      "Accès rapide à la voie express",
      "10 minutes du centre-ville",
    ],
    investment:
      "Le meilleur rapport rendement/risque de la ville. Vacance locative très faible sur les 3 pièces.",
    priceRange: "9 000 – 13 000 MAD/m²",
  },
  {
    slug: "centre-agadir",
    name: "Centre-ville & Talborjt",
    city: "Agadir",
    image: locationAgadir,
    intro:
      "L'Agadir historique reconstruit : avenues larges, immeubles de rapport et locaux commerciaux.",
    editorial: [
      "Talborjt et l'avenue Hassan II forment le poumon économique de la ville. On y achète surtout pour du rendement : plateaux de bureaux, immeubles de rapport, commerces en pied d'immeuble.",
      "Les projets de requalification urbaine engagés par la commune redonnent de la valeur à des adresses longtemps délaissées.",
    ],
    lifestyle: [
      "Administrations et banques",
      "Souk El Had à proximité",
      "Transports et taxis permanents",
      "Vie de quartier animée",
    ],
    investment:
      "Rendements bruts de 7 % à 9 % sur le commercial bien placé. Vigilance sur l'état technique des immeubles anciens.",
    priceRange: "8 000 – 15 000 MAD/m²",
  },
];

export type Article = {
  slug: string;
  title: string;
  category: string;
  /** Human-readable, French. */
  date: string;
  /** Same day in YYYY-MM-DD   for <time dateTime> and the editorial blog list. */
  iso: string;
  readTime: string;
  excerpt: string;
  image: string;
  body: string[];
};

export const articles: Article[] = [
  {
    slug: "marche-immobilier-agadir-2026",
    title: "Marché immobilier d'Agadir : ce qui a réellement changé en 2026",
    category: "Analyse de marché",
    date: "12 juin 2026",
    iso: "2026-06-12",
    readTime: "6 min",
    excerpt:
      "Prix au m², délais de vente, profil des acquéreurs : notre lecture du premier semestre, chiffres de nos transactions à l'appui.",
    image: locationAgadir,
    body: [
      "Le premier semestre 2026 confirme une tendance que nous observions déjà fin 2025 : le marché gadiri se scinde en deux. D'un côté, les biens de qualité, bien placés et correctement estimés, se vendent en moins de quatre-vingt-dix jours. De l'autre, les biens surévalués restent en vitrine plus de neuf mois et finissent par se négocier sous leur valeur réelle.",
      "Sur nos propres transactions, le prix moyen au mètre carré s'établit à 15 400 MAD dans le secteur balnéaire, contre 11 200 MAD dans les quartiers résidentiels intérieurs. L'écart s'est creusé de près de huit points en deux ans.",
      "Côté acquéreurs, la part des Marocains résidant à l'étranger reste stable autour de 30 %, mais leur profil évolue : moins de résidences secondaires, davantage d'investissements locatifs gérés à distance.",
      "Notre conseil aux vendeurs reste le même : faire estimer sérieusement, préparer le bien avant la mise en marché, et accepter que le prix d'annonce se décide avec des comparables signés, pas avec des annonces concurrentes.",
    ],
  },
  {
    slug: "guide-achat-etranger-maroc",
    title: "Acheter au Maroc quand on réside à l'étranger : le guide pratique",
    category: "Guide d'achat",
    date: "28 mai 2026",
    iso: "2026-05-28",
    readTime: "8 min",
    excerpt:
      "Compromis, notaire, transfert de fonds, rapatriement du produit de la vente : les étapes réelles, sans jargon.",
    image: editorial1,
    body: [
      "Un non-résident peut acquérir librement un bien immobilier urbain au Maroc. Les seules restrictions concernent les terrains agricoles. Le parcours est donc simple sur le principe, mais quelques points méritent d'être anticipés.",
      "Premier réflexe : ouvrir un compte en dirhams convertibles. C'est lui qui permettra, le jour de la revente, de rapatrier le produit de la vente et la plus-value dans la devise d'origine. Sans cette traçabilité, le rapatriement devient un dossier lourd.",
      "Deuxième point : le compromis de vente. Il fixe le prix, le délai, les conditions suspensives et le montant de l'acompte, généralement 10 %. Faites-le rédiger par un notaire ou un adoul, jamais sur un modèle trouvé en ligne.",
      "Troisième point : les frais. Comptez environ 6 à 7 % du prix pour les droits d'enregistrement, la conservation foncière et les honoraires de notaire. Ils sont à la charge de l'acquéreur.",
      "Enfin, une visite technique avant signature évite bien des déconvenues : étanchéité de terrasse, conformité du titre foncier, quitus de syndic. Nous l'organisons systématiquement pour nos acquéreurs à distance, en visioconférence si nécessaire.",
    ],
  },
  {
    slug: "vendre-au-bon-prix-agadir",
    title: "Vendre au bon prix : pourquoi les trois premières semaines décident de tout",
    category: "Conseil vendeur",
    date: "9 mai 2026",
    iso: "2026-05-09",
    readTime: "5 min",
    excerpt:
      "Un bien mal positionné dès le départ perd en moyenne 9 % de sa valeur finale. Voici comment l'éviter.",
    image: images.property1,
    body: [
      "Une mise en marché se joue dans les vingt premiers jours. C'est la période où votre bien est vu par les acheteurs déjà en recherche active   ceux qui connaissent les prix et qui décident vite.",
      "Si le prix d'annonce est trop haut, ces acheteurs-là passent leur chemin. Le bien vieillit, les visites s'espacent, et il faudra baisser deux ou trois fois pour finir sous le prix qu'on aurait obtenu en partant juste.",
      "Notre méthode : une estimation appuyée sur des transactions signées, un reportage photo professionnel, un plan coté, et une mise en ligne simultanée sur l'ensemble de nos canaux le même jour.",
      "Sur les 62 mandats exclusifs signés en 2025, le délai médian de vente a été de 74 jours, avec une décote moyenne de 2,4 % seulement entre prix d'annonce et prix signé.",
    ],
  },
  {
    slug: "investissement-locatif-taghazout",
    title: "Investissement locatif à Taghazout Bay : les chiffres réels",
    category: "Investissement",
    date: "21 avril 2026",
    iso: "2026-04-21",
    readTime: "7 min",
    excerpt:
      "Taux d'occupation, charges de copropriété, fiscalité : ce que rapporte vraiment un bien en station.",
    image: testimonialsImage,
    body: [
      "Taghazout Bay attire par sa promesse : océan, golf, resorts, et une saison qui s'étale désormais d'octobre à mai. Reste à savoir ce que cela donne une fois les charges déduites.",
      "Sur les biens que nous gérons dans la station, le taux d'occupation moyen s'établit à 61 % sur l'année, avec un pic à 84 % entre décembre et mars. Le loyer moyen à la nuitée pour un deux-pièces meublé se situe autour de 1 250 MAD.",
      "Les charges de copropriété sont élevées comptez 25 à 40 MAD/m²/mois selon la résidence car elles couvrent piscines, jardins et sécurité. À intégrer impérativement dans le calcul de rendement.",
      "Rendement net observé après charges, gestion et fiscalité : entre 4,2 % et 5,8 %. Honnête, mais moins spectaculaire que ce que promettent certains commercialisateurs.",
    ],
  },
  {
    slug: "quartiers-agadir-familles",
    title: "Où s'installer à Agadir quand on arrive en famille",
    category: "Vie locale",
    date: "3 avril 2026",
    iso: "2026-04-03",
    readTime: "6 min",
    excerpt:
      "Écoles, trajets, budget, ambiance : notre comparatif honnête des cinq quartiers les plus demandés.",
    image: locationFounty,
    body: [
      "La première question des familles qui s'installent à Agadir n'est jamais le prix au mètre carré : c'est la distance entre la maison et l'école.",
      "Founty reste le choix confort, avec la plage à pied et les établissements internationaux à moins de dix minutes en voiture. Le budget suit : comptez 2,8 à 4 millions de dirhams pour une villa correcte.",
      "Hay Mohammadi offre un excellent compromis. Un quatre-pièces de 150 m² s'y négocie autour de 1,6 million, avec des écoles publiques et privées de proximité et des commerces à chaque coin de rue.",
      "Le secteur touristique convient aux familles sans enfants scolarisés sur place ou aux séjours de quelques années : appartements récents, services, mais une vie de quartier plus saisonnière.",
    ],
  },
];

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  location: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Fatima Zahra Benkirane",
    role: "Acquéreuse – Villa à Founty",
    location: "Casablanca",
    quote:
      "Nous cherchions depuis un an sans rien trouver de sérieux. Yassine nous a montré quatre biens, pas quarante, et le troisième était le bon. Il connaissait l'historique du terrain mieux que le vendeur lui-même.",
  },
  {
    name: "Thomas Rouvière",
    role: "Investisseur – Appartement à la Marina",
    location: "Lyon, France",
    quote:
      "J'achète à distance depuis la France. Visite en visio, dossier notarial préparé, quittances envoyées chaque mois. Trois ans plus tard, je n'ai toujours pas eu à prendre l'avion pour un problème.",
  },
  {
    name: "Hicham Ait Baha",
    role: "Vendeur – Duplex à Hay Mohammadi",
    location: "Agadir",
    quote:
      "L'estimation de Nadia était 180 000 dirhams en dessous de ce qu'une autre agence m'avait annoncé. J'ai râlé. J'ai signé au prix de son estimation en cinquante-deux jours.",
  },
  {
    name: "Sophie & Marc Delaunay",
    role: "Acquéreurs – Riad rénové",
    location: "Bruxelles, Belgique",
    quote:
      "Salma a pris le temps de nous expliquer chaque document, en français, sans jamais nous presser. C'est rare et ça change tout quand on achète dans un pays qu'on connaît mal.",
  },
  {
    name: "Rachid El Ouafi",
    role: "Propriétaire – Gestion locative",
    location: "Montréal, Canada",
    quote:
      "Karim gère trois de mes lots depuis 2021. Zéro impayé, deux rotations de locataires bien gérées, et un reporting clair chaque trimestre. Je dors tranquille.",
  },
  {
    name: "Laila Amrani",
    role: "Acquéreuse – Premier achat",
    location: "Agadir",
    quote:
      "Premier achat, budget serré, beaucoup de questions bêtes. Personne ne m'a fait sentir que je faisais perdre du temps à qui que ce soit.",
  },
];

/**
 * Only what the agency can actually back: the creation date, the breadth of the
 * offer and the size of the team. Volume figures wait for the real numbers.
 */
export const stats = [
  { value: 2024, suffix: "", label: "création de l'agence, le 30 octobre" },
  { value: 7, suffix: "", label: "métiers réunis sous le même toit" },
  { value: 4, suffix: "", label: "conseillers, un référent par dossier" },
  { value: 5, suffix: "", label: "quartiers du Grand Agadir couverts" },
];

export const services = [
  {
    slug: "achat",
    title: "Achat",
    image: property1,
    summary:
      "Une sélection resserrée, des visites préparées et une vérification juridique avant toute offre.",
    points: [
      "Définition précise du cahier des charges",
      "Accès aux biens off-market de notre portefeuille",
      "Vérification du titre foncier et du quitus de syndic",
      "Négociation et accompagnement jusqu'à la signature",
    ],
  },
  {
    slug: "vente",
    title: "Vente",
    image: teamOffice,
    summary:
      "Estimation appuyée sur des transactions signées, reportage professionnel et diffusion coordonnée.",
    points: [
      "Rapport d'évaluation détaillé sous 72 h",
      "Reportage photo et plan coté inclus",
      "Diffusion multicanal et fichier acquéreurs qualifiés",
      "Compte rendu de visites hebdomadaire",
    ],
  },
  {
    slug: "location",
    title: "Location",
    image: property2,
    summary:
      "Recherche de locataires solvables, rédaction des baux et état des lieux contradictoire.",
    points: [
      "Étude de solvabilité systématique",
      "Bail conforme à la loi 67-12",
      "État des lieux photographique",
      "Remise des clés et suivi de première année",
    ],
  },
  {
    slug: "estimation",
    title: "Estimation & expertise",
    image: editorial1,
    summary:
      "Une valeur vénale argumentée, acceptée par les banques et les notaires de la place.",
    points: [
      "Analyse des comparables signés",
      "Visite technique du bien",
      "Rapport écrit remis sous 72 h",
      "Estimation gratuite et sans engagement",
    ],
  },
  {
    slug: "investissement",
    title: "Investissement",
    image: locationAgadir,
    summary:
      "Sélection de biens à rendement, calculs nets de charges et stratégie de sortie.",
    points: [
      "Étude de rendement net, pas brut",
      "Analyse de la demande locative du secteur",
      "Montage et mise en relation bancaire",
      "Suivi de la valorisation dans le temps",
    ],
  },
  {
    slug: "gestion",
    title: "Gestion locative",
    image: locationMarina,
    summary:
      "Votre bien géré comme si vous étiez sur place, où que vous soyez dans le monde.",
    points: [
      "Encaissement des loyers et relances",
      "Entretien courant et interventions d'urgence",
      "Reporting trimestriel détaillé",
      "Assistance fiscale et déclarations",
    ],
  },
  {
    slug: "accompagnement",
    title: "Accompagnement personnalisé",
    image: locationFounty,
    summary:
      "Un interlocuteur unique, joignable, du premier appel à la remise des clés   et après.",
    points: [
      "Un conseiller référent par dossier",
      "Coordination notaire, banque et artisans",
      "Assistance à l'installation et aux démarches",
      "Suivi après signature",
    ],
  },
];

export const values = [
  {
    title: "Franchise",
    image: teamOffice,
    text: "Nous disons le prix que vaut un bien, même quand ce n'est pas celui qu'on espère entendre. C'est ce qui fait revenir nos clients.",
  },
  {
    title: "Connaissance du terrain",
    image: locationFounty,
    text: "Rue par rue, immeuble par immeuble. Le Grand Agadir se marche avant de se vendre : aucune base de données ne remplace le terrain.",
  },
  {
    title: "Rigueur juridique",
    image: property3,
    text: "Titre foncier, servitudes, conformité : chaque dossier est vérifié avant d'engager qui que ce soit.",
  },
  {
    title: "Disponibilité",
    image: locationTaghazout,
    text: "Un conseiller référent, joignable, qui répond aussi le samedi matin quand une visite doit se caler.",
  },
];

export function formatMAD(value: number) {
  return new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 })
    .format(value)
    .replace(/\u202f|\u00a0/g, " ");
}

export function getProperty(slug: string) {
  return properties.find((p) => p.slug === slug);
}

export function getAgent(slug: string) {
  return agents.find((a) => a.slug === slug);
}

export function getLocation(slug: string) {
  return locations.find((l) => l.slug === slug);
}

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}

export function propertiesByAgent(slug: string) {
  return properties.filter((p) => p.agentSlug === slug);
}

export function propertiesByLocation(slug: string) {
  return properties.filter((p) => p.locationSlug === slug);
}
