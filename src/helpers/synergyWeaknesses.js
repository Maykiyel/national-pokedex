import axios from "axios";

// We can store fetched type data in a cache to avoid repeated requests.
const typeDataCache = {};

// A list of all 18 Pokémon types (in lowercase).
const ALL_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

/**
 * For multi-type Pokémon, we combine type multipliers.
 * e.g., Grass/Poison => net synergy for Fire is x2 (Grass is weak, Poison is neutral).
 */
export async function computeSynergyWeaknesses(pokemonTypes) {
  // 1. Initialize multipliers for all possible attacking types
  const multipliers = {};
  ALL_TYPES.forEach((t) => {
    multipliers[t] = 1.0;
  });

  // 2. For each type the Pokémon has, multiply the relevant attacking types
  for (const typeObj of pokemonTypes) {
    const typeName = typeObj.type.name.toLowerCase();
    let data = typeDataCache[typeName];

    // Fetch from API if not cached
    if (!data) {
      const response = await axios.get(
        `https://pokeapi.co/api/v2/type/${typeName}`
      );
      data = response.data.damage_relations;
      typeDataCache[typeName] = data;
    }

    // Double damage (multiply by 2.0)
    data.double_damage_from.forEach(({ name }) => {
      multipliers[name] *= 2.0;
    });

    // Half damage (multiply by 0.5)
    data.half_damage_from.forEach(({ name }) => {
      multipliers[name] *= 0.5;
    });

    // No damage (multiply by 0.0)
    data.no_damage_from.forEach(({ name }) => {
      multipliers[name] *= 0.0;
    });
  }

  // 3. Collect the final weaknesses: attacking types with multiplier > 1.0
  const synergyWeaknesses = [];
  for (const [attackingType, multiplier] of Object.entries(multipliers)) {
    if (multiplier > 1) {
      synergyWeaknesses.push(attackingType);
    }
  }

  return synergyWeaknesses;
}
