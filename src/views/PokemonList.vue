<template>
    <v-container>
        <h1 class="white--text text-center">Pokédex</h1>

        <!-- Search and Sort Bar -->
        <v-row align="center" justify="space-between">
            <v-col cols="12" sm="4">
                <SearchBar v-model="searchQuery" :suggestions="pokemonSuggestions" @search="performSearch" />
            </v-col>
            <v-col cols="auto">
                <SortBar v-model="selectedSort" :sortOptions="sortOptions" />
            </v-col>
        </v-row>

        <!-- Pokémon Grid -->
        <v-row v-if="processedPokemonList.length">
            <v-col v-for="pokemon in processedPokemonList" :key="pokemon.id" cols="12" sm="6" md="4" lg="3">
                <PokemonCard :id="pokemon.id" :name="pokemon.name || 'Unknown'"
                    :image="partialDetails[pokemon.id] ? partialDetails[pokemon.id].image : getPokemonImage(pokemon.id)"
                    :types="partialDetails[pokemon.id] ? partialDetails[pokemon.id].types : []"
                    @click="viewDetails(pokemon.name)" />
            </v-col>
        </v-row>
        <p v-else>Loading Pokémon...</p>

        <!-- Load More Button (only if not searching and there are more items) -->
        <v-row justify="center" v-if="!searchQuery && pokemonList.length > displayCount">
            <v-col cols="12" class="text-center">
                <v-btn color="primary" @click="loadMore">
                    Load more Pokémon
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import PokemonCard from "@/components/PokemonCard.vue";
import SearchBar from "@/components/SearchBar.vue";
import SortBar from "@/components/SortBar.vue";
import capitalizeMixin from "@/mixins/mixin";

export default {
    name: "PokemonList",
    components: {
        PokemonCard,
        SearchBar,
        SortBar,
    },
    mixins: [capitalizeMixin],
    data() {
        return {
            searchQuery: "",
            displayCount: 12,
            selectedSort: "lowestNumber",
            sortOptions: [
                { text: "Lowest Number (First)", value: "lowestNumber" },
                { text: "Highest Number (First)", value: "highestNumber" },
                { text: "A-Z", value: "aToZ" },
                { text: "Z-A", value: "zToA" },
            ],
        };
    },
    computed: {
        ...mapState(["pokemonList", "partialDetailsById"]),
        // Suggestions for the SearchBar
        pokemonSuggestions() {
            return this.pokemonList.map((p) => this.capitalize(p.name));
        },
        // Consolidated processing: filter, sort, then limit if no search query.
        processedPokemonList() {
            let list = [...this.pokemonList];
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                list = list.filter(
                    (pokemon) =>
                        pokemon.name.toLowerCase().includes(query) ||
                        String(pokemon.id).includes(query)
                );
            }
            switch (this.selectedSort) {
                case "lowestNumber":
                    list.sort((a, b) => a.id - b.id);
                    break;
                case "highestNumber":
                    list.sort((a, b) => b.id - a.id);
                    break;
                case "aToZ":
                    list.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case "zToA":
                    list.sort((a, b) => b.name.localeCompare(a.name));
                    break;
            }
            if (!this.searchQuery) {
                return list.slice(0, this.displayCount);
            }
            return list;
        },
        // Shortcut to access partial details cache.
        partialDetails() {
            return this.partialDetailsById;
        },
    },
    watch: {
        // Whenever the processed list changes, fetch partial details for each displayed Pokémon.
        processedPokemonList: {
            immediate: true,
            handler(newList) {
                newList.forEach((pokemon) => {
                    this.fetchPartialPokemon(pokemon);
                });
            },
        },
    },
    methods: {
        ...mapActions(["fetchPokemonList", "fetchPartialPokemon"]),
        viewDetails(name) {
            this.$router.push({ name: "PokemonDetails", params: { id: name } });
        },
        loadMore() {
            this.displayCount = Math.min(
                this.displayCount + 20,
                this.pokemonList.length
            );
        },
        performSearch(query) {
            this.searchQuery = query;
        },
        // Fallback image generator (in case partial details are not loaded yet)
        getPokemonImage(id) {
            return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
        },
    },
    created() {
        if (!this.pokemonList.length) {
            this.fetchPokemonList();
        }
    },
};
</script>

<style scoped>
.sort-dropdown {
    width: 250px;
}
</style>