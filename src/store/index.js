import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import { computeSynergyWeaknesses } from "@/helpers/synergyWeaknesses.js";

Vue.use(Vuex);

// Recursively traverse the evolution chain.
function extractEvolutionChain(chain) {
  let evolutions = [];
  function traverse(chain) {
    if (!chain) return;
    evolutions.push(chain.species.name);
    chain.evolves_to.forEach(traverse);
  }
  traverse(chain);
  return evolutions;
}

// Fetch details for each evolution (id, name, image, types).
async function fetchEvolutionDetails(evolutionNames) {
  try {
    const evolutions = await Promise.all(
      evolutionNames.map(async (name) => {
        try {
          const res = await axios.get(
            `https://pokeapi.co/api/v2/pokemon/${name}`
          );
          return {
            id: res.data.id,
            name: res.data.name,
            image:
              res.data.sprites.other["official-artwork"].front_default ||
              res.data.sprites.front_default,
            types: res.data.types.map((t) => t.type.name),
          };
        } catch (error) {
          console.error(`Error fetching evolution details for ${name}:`, error);
          return null;
        }
      })
    );
    return evolutions.filter((evo) => evo !== null);
  } catch (error) {
    console.error("Error fetching evolution details:", error);
    return [];
  }
}

// Normalize full Pokémon data.
function formatPokemonData(data) {
  return {
    id: data.id,
    name: data.name,
    height: data.height, // in decimeters
    weight: data.weight, // in hectograms
    types: data.types.map((t) => t.type.name),
    abilities: data.abilities.map((a) => a.ability.name),
    stats: data.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
    image:
      data.sprites.other["official-artwork"].front_default ||
      data.sprites.front_default,
  };
}

export default new Vuex.Store({
  state: {
    // Minimal list of all Pokémon: each item is { id, name, url }
    pokemonList: [],
    // For paginating the minimal list.
    currentOffset: 0,
    listLimit: 1025,

    // Detailed info for the selected Pokémon.
    selectedPokemon: null,
    selectedPokemonSpecies: null,
    selectedPokemonWeaknesses: [],
    selectedPokemonEvolutions: [],

    // Cache for partial details (image and types) for the list,
    // keyed by Pokémon id.
    partialDetailsById: {},
  },
  mutations: {
    SET_POKEMON_LIST(state, data) {
      state.pokemonList = data;
    },
    APPEND_POKEMON_LIST(state, data) {
      state.pokemonList = state.pokemonList.concat(data);
    },
    SET_CURRENT_OFFSET(state, offset) {
      state.currentOffset = offset;
    },
    SET_SELECTED_POKEMON(state, data) {
      state.selectedPokemon = data;
    },
    SET_SELECTED_POKEMON_SPECIES(state, data) {
      state.selectedPokemonSpecies = data;
    },
    SET_SELECTED_POKEMON_WEAKNESSES(state, data) {
      state.selectedPokemonWeaknesses = data;
    },
    SET_SELECTED_POKEMON_EVOLUTIONS(state, data) {
      state.selectedPokemonEvolutions = data;
    },
    // Cache partial details for a Pokémon (image and types)
    SET_PARTIAL_DETAILS(state, { id, data }) {
      Vue.set(state.partialDetailsById, id, data);
    },
  },
  actions: {
    // Fetch a minimal list of Pokémon (without full details) in chunks.
    async fetchPokemonList({ commit, state }) {
      try {
        const { currentOffset, listLimit } = state;
        const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon?offset=${currentOffset}&limit=${listLimit}`
        );
        // Create a minimal list (extract id from the URL)
        const minimalList = response.data.results.map((p) => {
          const match = p.url.match(/pokemon\/(\d+)\//);
          const id = match ? parseInt(match[1], 10) : null;
          return { id, name: p.name, url: p.url };
        });
        if (currentOffset === 0) {
          commit("SET_POKEMON_LIST", minimalList);
        } else {
          commit("APPEND_POKEMON_LIST", minimalList);
        }
        commit("SET_CURRENT_OFFSET", currentOffset + listLimit);
      } catch (error) {
        console.error("Error fetching Pokémon list:", error);
      }
    },

    // Action to fetch partial details (image and types) for a Pokémon in the list.
    async fetchPartialPokemon({ commit, state }, pokemonItem) {
      if (state.partialDetailsById[pokemonItem.id]) return; // Already fetched.
      try {
        const res = await axios.get(pokemonItem.url);
        const data = {
          image:
            res.data.sprites.other["official-artwork"].front_default ||
            res.data.sprites.front_default,
          types: res.data.types.map((t) => t.type.name),
        };
        commit("SET_PARTIAL_DETAILS", { id: pokemonItem.id, data });
      } catch (error) {
        console.error(
          "Error fetching partial details for",
          pokemonItem.name,
          error
        );
      }
    },

    // Fetch full details for a specific Pokémon by name or ID.
    async fetchPokemonDetails({ commit }, pokemonIdentifier) {
      try {
        // 1. Fetch main Pokémon data.
        const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${pokemonIdentifier}`
        );
        const formattedData = formatPokemonData(response.data);
        commit("SET_SELECTED_POKEMON", formattedData);

        // 2. Fetch species data (for description, category, etc.)
        const speciesResponse = await axios.get(response.data.species.url);
        commit("SET_SELECTED_POKEMON_SPECIES", speciesResponse.data);

        // 3. Fetch evolution chain.
        const evolutionChainResponse = await axios.get(
          speciesResponse.data.evolution_chain.url
        );
        const evolutionNames = extractEvolutionChain(
          evolutionChainResponse.data.chain
        );
        const evolutionData = await fetchEvolutionDetails(evolutionNames);
        commit("SET_SELECTED_POKEMON_EVOLUTIONS", evolutionData);

        // 4. Compute synergy-based weaknesses.
        const synergyWeaknesses = await computeSynergyWeaknesses(
          response.data.types
        );
        commit("SET_SELECTED_POKEMON_WEAKNESSES", synergyWeaknesses);
      } catch (error) {
        console.error(
          `Error fetching details for ${pokemonIdentifier}:`,
          error
        );
      }
    },
  },
});
