/**
 * Pokemon MCP — wraps PokeAPI (free, no auth required)
 *
 * Tools:
 * - get_pokemon: Get Pokemon details by name or ID
 * - get_type: Get type damage relations and Pokemon list
 * - get_ability: Get ability description and Pokemon list
 * - get_evolution_chain: Get full evolution chain by chain ID
 */

interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

const BASE_URL = 'https://pokeapi.co/api/v2';

// --- Raw API types ---

type RawStat = {
  base_stat: number;
  stat: { name: string };
};

type RawType = {
  type: { name: string };
};

type RawAbility = {
  ability: { name: string };
  is_hidden: boolean;
};

type RawSprites = {
  front_default: string | null;
  front_shiny: string | null;
};

type RawPokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: RawType[];
  stats: RawStat[];
  abilities: RawAbility[];
  sprites: RawSprites;
};

type RawDamageRelations = {
  double_damage_to: { name: string }[];
  double_damage_from: { name: string }[];
  half_damage_to: { name: string }[];
  half_damage_from: { name: string }[];
  no_damage_to: { name: string }[];
  no_damage_from: { name: string }[];
};

type RawTypeResponse = {
  name: string;
  damage_relations: RawDamageRelations;
  pokemon: { pokemon: { name: string; url: string } }[];
};

type RawEffectEntry = {
  effect: string;
  short_effect: string;
  language: { name: string };
};

type RawAbilityPokemon = {
  pokemon: { name: string; url: string };
  is_hidden: boolean;
};

type RawAbilityResponse = {
  name: string;
  effect_entries: RawEffectEntry[];
  pokemon: RawAbilityPokemon[];
};

type RawEvolutionDetail = {
  min_level: number | null;
  trigger: { name: string } | null;
  item: { name: string } | null;
};

type RawChainLink = {
  species: { name: string };
  evolution_details: RawEvolutionDetail[];
  evolves_to: RawChainLink[];
};

type RawEvolutionChain = {
  id: number;
  chain: RawChainLink;
};

// --- Tool definitions ---

const tools: McpToolExport['tools'] = [
  {
    name: 'get_pokemon',
    description:
      'Get Pokemon details by name or ID. Returns name, ID, types, base stats (HP, attack, defense, etc.), abilities, height, weight, and sprites.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Pokemon name (e.g., "pikachu") or numeric ID (e.g., "25")',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'get_type',
    description:
      'Get type effectiveness information and Pokemon list for a given type. Returns damage relations (double/half/no damage to and from) and the first 20 Pokemon of that type.',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Type name (e.g., "fire", "water", "electric")',
        },
      },
      required: ['type'],
    },
  },
  {
    name: 'get_ability',
    description:
      'Get ability details including effect description and the list of Pokemon that can have this ability.',
    inputSchema: {
      type: 'object',
      properties: {
        ability: {
          type: 'string',
          description: 'Ability name (e.g., "overgrow", "blaze", "static")',
        },
      },
      required: ['ability'],
    },
  },
  {
    name: 'get_evolution_chain',
    description:
      'Get the full evolution chain by chain ID. Returns each species in the chain with its evolution trigger, minimum level, and evolution item.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Evolution chain ID (e.g., 1 for Bulbasaur line, 10 for Caterpie line)',
        },
      },
      required: ['id'],
    },
  },
];

// --- callTool dispatcher ---

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'get_pokemon':
      return getPokemon(args.name as string);
    case 'get_type':
      return getType(args.type as string);
    case 'get_ability':
      return getAbility(args.ability as string);
    case 'get_evolution_chain':
      return getEvolutionChain(args.id as number);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// --- Tool implementations ---

async function getPokemon(name: string) {
  const res = await fetch(`${BASE_URL}/pokemon/${encodeURIComponent(name.toLowerCase())}`);
  if (!res.ok) throw new Error(`PokeAPI error: ${res.status}`);

  const data = (await res.json()) as RawPokemon;

  const stats: Record<string, number> = {};
  for (const s of data.stats) {
    stats[s.stat.name] = s.base_stat;
  }

  return {
    id: data.id,
    name: data.name,
    height: data.height,
    weight: data.weight,
    types: data.types.map((t) => t.type.name),
    stats,
    abilities: data.abilities.map((a) => ({
      name: a.ability.name,
      is_hidden: a.is_hidden,
    })),
    sprites: {
      front_default: data.sprites.front_default,
      front_shiny: data.sprites.front_shiny,
    },
  };
}

async function getType(type: string) {
  const res = await fetch(`${BASE_URL}/type/${encodeURIComponent(type.toLowerCase())}`);
  if (!res.ok) throw new Error(`PokeAPI error: ${res.status}`);

  const data = (await res.json()) as RawTypeResponse;
  const dr = data.damage_relations;

  return {
    name: data.name,
    damage_relations: {
      double_damage_to: dr.double_damage_to.map((t) => t.name),
      double_damage_from: dr.double_damage_from.map((t) => t.name),
      half_damage_to: dr.half_damage_to.map((t) => t.name),
      half_damage_from: dr.half_damage_from.map((t) => t.name),
      no_damage_to: dr.no_damage_to.map((t) => t.name),
      no_damage_from: dr.no_damage_from.map((t) => t.name),
    },
    pokemon: data.pokemon.slice(0, 20).map((p) => p.pokemon.name),
    total_pokemon: data.pokemon.length,
  };
}

async function getAbility(ability: string) {
  const res = await fetch(`${BASE_URL}/ability/${encodeURIComponent(ability.toLowerCase())}`);
  if (!res.ok) throw new Error(`PokeAPI error: ${res.status}`);

  const data = (await res.json()) as RawAbilityResponse;

  const englishEntry = data.effect_entries.find((e) => e.language.name === 'en');

  return {
    name: data.name,
    effect: englishEntry?.effect ?? null,
    short_effect: englishEntry?.short_effect ?? null,
    pokemon: data.pokemon.map((p) => ({
      name: p.pokemon.name,
      is_hidden: p.is_hidden,
    })),
  };
}

function flattenChain(link: RawChainLink): object[] {
  const detail = link.evolution_details[0] ?? null;
  const entry = {
    species: link.species.name,
    evolution_trigger: detail?.trigger?.name ?? null,
    min_level: detail?.min_level ?? null,
    item: detail?.item?.name ?? null,
  };
  const rest = link.evolves_to.flatMap((next) => flattenChain(next));
  return [entry, ...rest];
}

async function getEvolutionChain(id: number) {
  const res = await fetch(`${BASE_URL}/evolution-chain/${id}`);
  if (!res.ok) throw new Error(`PokeAPI error: ${res.status}`);

  const data = (await res.json()) as RawEvolutionChain;

  return {
    id: data.id,
    chain: flattenChain(data.chain),
  };
}

export default { tools, callTool } satisfies McpToolExport;
