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

// Normalize the Pokémon data for consistent consumption.
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
    pokemonList: [],
    selectedPokemon: null, // Normalized Pokémon details
    selectedPokemonSpecies: null, // Contains description, category, etc.
    selectedPokemonWeaknesses: [], // Dynamically fetched synergy-based weaknesses
    selectedPokemonEvolutions: [], // Evolution chain (array of objects with id, name, image)
  },

  mutations: {
    SET_POKEMON_LIST(state, data) {
      state.pokemonList = data;
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
  },
  actions: {
    // Fetch a basic list of the first 151 Pokémon.
    async fetchPokemonList({ commit }) {
      try {
        const response = await axios.get(
          "https://pokeapi.co/api/v2/pokemon?limit=1025"
        );
        const pokemonData = await Promise.all(
          response.data.results.map(async (pokemon) => {
            try {
              const details = await axios.get(pokemon.url);
              return {
                id: details.data.id,
                name: details.data.name,
                types: details.data.types.map((t) => t.type.name),
                image:
                  details.data.sprites.other["official-artwork"]
                    .front_default || details.data.sprites.front_default,
              };
            } catch (error) {
              console.error(
                `Failed to fetch details for ${pokemon.name}:`,
                error
              );
              return null;
            }
          })
        );
        const filteredData = pokemonData.filter((p) => p !== null);
        commit("SET_POKEMON_LIST", filteredData);
      } catch (error) {
        console.error("Error fetching Pokémon list:", error);
      }
    },

    // Fetch detailed data for a specific Pokémon by name or ID.
    async fetchPokemonDetails({ commit }, pokemonIdentifier) {
      try {
        // 1. Fetch main Pokémon data
        const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${pokemonIdentifier}`
        );
        const formattedData = formatPokemonData(response.data);
        commit("SET_SELECTED_POKEMON", formattedData);

        // 2. Fetch species data (for description, category, etc.)
        const speciesResponse = await axios.get(response.data.species.url);
        commit("SET_SELECTED_POKEMON_SPECIES", speciesResponse.data);

        // 3. Evolution chain
        const evolutionChainResponse = await axios.get(
          speciesResponse.data.evolution_chain.url
        );
        const evolutionNames = extractEvolutionChain(
          evolutionChainResponse.data.chain
        );
        const evolutionData = await fetchEvolutionDetails(evolutionNames);
        commit("SET_SELECTED_POKEMON_EVOLUTIONS", evolutionData);

        // 4. Compute synergy-based weaknesses
        //    Use the data from the API's "types" array
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
