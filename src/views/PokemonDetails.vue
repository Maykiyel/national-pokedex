<template>
    <div>
        <v-container fluid v-if="selectedPokemon" class="dark">
            <!-- Back to Pokémon List -->
            <v-btn large text color="white--text" @click="goBackToList">
                <v-icon>mdi-arrow-left</v-icon>
                <span>Back to list</span>
            </v-btn>
            <!-- Small screen header (visible only on xs and sm) -->
            <v-row justify="center" class="hidden-sm-and-up">
                <v-col cols="12">
                    <v-card-title class="pb-0 justify-center white--text pokemon-name-title">
                        <!-- Base Name -->
                        <span class="text-h4 font-weight-medium">
                            {{ baseName }}
                        </span>
                        <!-- Pokémon Number -->
                        <span class="text-h5 font-weight-medium grey--text font-italic">
                            #{{ basePokemonId }}
                        </span>

                    </v-card-title>
                </v-col>
            </v-row>

            <!-- Main Details Row -->
            <v-row justify="center">
                <!-- Left Column: Pokémon Image -->
                <v-col cols="12" sm="6" md="4">
                    <v-card elevation="2" class="pa-4 mb-4">
                        <v-img :src="selectedPokemon.image" :alt="selectedPokemon.name" contain
                            class="blue-grey darken-4"></v-img>
                    </v-card>

                    <!-- Base Stats -->
                    <v-card elevation="2" class="pa-4">
                        <v-card-title class="text-h4 pb-0">Base Stats</v-card-title>
                        <v-card-text>
                            <v-list dense>
                                <v-list-item v-for="stat in selectedPokemon.stats" :key="stat.name">
                                    <v-list-item-content>
                                        <v-list-item-title>
                                            <span class="font-weight-bold">{{ capitalize(stat.name) }}:</span>
                                            <span>{{ stat.value }}</span>
                                        </v-list-item-title>
                                        <v-progress-linear :value="stat.value" color="blue"
                                            height="12"></v-progress-linear>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list>
                        </v-card-text>
                    </v-card>
                </v-col>

                <!-- Right Column: Description, Abilities, Types, Weaknesses, Alternate Forms -->
                <v-col cols="12" sm="6" md="4">
                    <v-card elevation="0" class="pa-4 pb-0 transparent">
                        <!-- Large screen header for Name & Alt Form -->
                        <v-card-title class="hidden-xs-only pokemon-name-title">

                            <!-- Base Name -->
                            <span class="text-h4 text-md-h3 text-lg-h2 font-weight-medium">
                                {{ baseName }}
                            </span>
                            <!-- Pokémon Number -->
                            <span class="text-h6 text-md-h5 text-lg-h4 font-weight-medium grey--text font-italic">
                                #{{ basePokemonId }}
                            </span>
                        </v-card-title>
                        <v-card-subtitle>
                            <!-- Alt Form Label on new line if present -->
                            <br v-if="altFormLabel" />
                            <span v-if="altFormLabel"
                                class="text-h6 text-md-h5 text-lg-h4 font-weight-medium grey--text font-italic">
                                {{ altFormLabel }}
                            </span>
                        </v-card-subtitle>

                        <!-- Description Section -->
                        <v-card-text class="body-1">
                            <em>{{ description }}</em>
                        </v-card-text>

                        <!-- Abilities & Dimensions -->
                        <v-card-text>
                            <div>
                                <strong>Abilities:</strong> {{ selectedPokemon.abilities.join(', ') }}
                            </div>
                            <div>
                                <strong>Height:</strong> {{ convertHeight(selectedPokemon.height) }}
                                <strong>Weight:</strong> {{ convertWeight(selectedPokemon.weight) }}
                            </div>
                        </v-card-text>
                    </v-card>

                    <!-- Typing & Weaknesses -->
                    <v-card elevation="0" class="pa-4 transparent">
                        <v-card-title class="subtitle-1 pb-0">Type</v-card-title>
                        <v-card-text class="mb-0">
                            <TypeBadge :types="getTypes" />
                        </v-card-text>
                        <v-card-title class="subtitle-1 pb-0">Weaknesses</v-card-title>
                        <v-card-text>
                            <div v-if="selectedPokemonWeaknesses.length">
                                <TypeBadge :types="selectedPokemonWeaknesses" />
                            </div>
                            <div v-else>
                                <em>No weaknesses found.</em>
                            </div>
                        </v-card-text>
                    </v-card>

                    <!-- Alternate Forms Section -->
                    <v-col cols="12" md="8" v-if="alternateForms.length > 1">
                        <v-select v-model="selectedForm" :items="alternateFormsDisplay" label="Alternate Forms" outlined
                            dense @change="changeForm" class="mb-4"></v-select>
                    </v-col>
                </v-col>
            </v-row>

            <!-- Evolution Line Row -->
            <v-row justify="center">
                <v-col cols="12" md="8">
                    <v-card elevation="3" shaped class="pa-4 mb-4">
                        <v-card-title class="text-h5 font-weight-medium">Evolutions</v-card-title>
                        <v-card-text>
                            <div v-if="selectedPokemonEvolutions.length > 1">
                                <v-row justify="center" align="center">
                                    <v-col v-for="evo in selectedPokemonEvolutions" :key="evo.id" cols="12" sm="4">
                                        <PokemonCard :id="evo.id" :name="evo.name" :image="evo.image"
                                            :types="evo.types" />
                                    </v-col>
                                </v-row>
                            </div>
                            <div v-else>
                                <em>This Pokemon does not evolve</em>
                            </div>
                        </v-card-text>
                    </v-card>
                    <div class="text-right mt-2">
                        <v-btn color="primary" elevation="2" large raised @click="goBackToList">
                            Explore more Pokémon
                        </v-btn>
                    </div>
                </v-col>
            </v-row>
        </v-container>

        <!-- Loading State -->
        <v-container fluid v-else>
            <v-row justify="center" align="center">
                <v-col cols="12" class="text-center">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    <p>Loading Pokémon details...</p>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import TypeBadge from "@/components/TypeBadge.vue";
import PokemonCard from "@/components/PokemonCard.vue";
import capitalizeMixin from "@/mixins/mixin";

export default {
    name: "PokemonDetails",
    components: {
        TypeBadge,
        PokemonCard,
    },
    mixins: [capitalizeMixin],
    data() {
        return {
            selectedForm: null,
        };
    },
    computed: {
        ...mapState([
            "selectedPokemon",
            "selectedPokemonWeaknesses",
            "selectedPokemonEvolutions",
            "selectedPokemonSpecies",
        ]),

        // Use parseName to get both base and alternate labels
        nameParts() {
            if (!this.selectedPokemon) {
                return { base: "", alt: "" };
            }
            return this.parseName(this.selectedPokemon.name);
        },

        baseName() {
            return this.nameParts.base;
        },

        altFormLabel() {
            return this.nameParts.alt;
        },

        displayName() {
            return this.baseName;
        },

        basePokemonId() {
            return this.selectedPokemonSpecies
                ? this.selectedPokemonSpecies.id
                : this.selectedPokemon.id;
        },

        getTypes() {
            return this.selectedPokemon.types;
        },

        description() {
            if (!this.selectedPokemonSpecies) return "";
            const entry = this.selectedPokemonSpecies.flavor_text_entries.find(
                (entry) => entry.language.name === "en"
            );
            return entry ? entry.flavor_text.replace(/\f|\n/g, " ") : "";
        },

        alternateForms() {
            if (
                this.selectedPokemonSpecies &&
                this.selectedPokemonSpecies.varieties &&
                this.selectedPokemonSpecies.varieties.length > 1
            ) {
                return this.selectedPokemonSpecies.varieties
                    .map((v) => v.pokemon)
                    .filter((pokemon) => !pokemon.name.includes("totem"));
            }
            return [];
        },

        alternateFormsDisplay() {
            return this.alternateForms.map((form) => {
                const parts = this.parseName(form.name);
                const label = parts.alt ? `${parts.alt} ${parts.base}` : parts.base;
                return {
                    text: label,
                    value: form.name,
                };
            });
        },
    },
    methods: {
        ...mapActions(["fetchPokemonDetails"]),

        // Convert decimeters to meters
        convertHeight(heightDecimeters) {
            return (heightDecimeters / 10).toFixed(1) + "m";
        },

        // Convert hectograms to kilograms
        convertWeight(weightHectograms) {
            return (weightHectograms / 10).toFixed(1) + "kg";
        },

        goBackToList() {
            this.$router.push({ name: "PokemonList" });
        },

        fetchData(routeObj) {
            const route = routeObj || this.$route;
            const baseId = route.params.id;
            const altForm = route.query.form;
            if (altForm) {
                this.fetchPokemonDetails(altForm);
            } else {
                this.fetchPokemonDetails(baseId);
            }
        },

        changeForm(newForm) {
            const baseId = this.selectedPokemonSpecies?.id || this.selectedPokemon.id;
            const newRoute = {
                name: "PokemonDetails",
                params: { id: String(baseId) },
                query: { form: newForm },
            };
            if (
                this.$route.params.id === String(baseId) &&
                this.$route.query.form === newForm
            ) {
                return;
            }
            this.$router.push(newRoute);
        },

        parseName(rawName) {
            const lower = rawName.toLowerCase();
            if (!lower.includes("-")) {
                return { base: this.capitalize(lower), alt: "" };
            }
            let parts = lower.split("-");
            if (
                (parts[parts.length - 1] === "x" || parts[parts.length - 1] === "y") &&
                parts.includes("mega")
            ) {
                const suffix = parts.pop();
                parts = parts.filter((p) => p !== "mega");
                return {
                    base: this.capitalize(parts.join(" ")),
                    alt: `Mega ${suffix.toUpperCase()}`,
                };
            } else {
                const altSuffix = parts.pop();
                const altFormMap = {
                    mega: "Mega",
                    gmax: "Gigantamax",
                    alola: "Alolan",
                    galar: "Galarian",
                };
                return {
                    base: this.capitalize(parts.join(" ")),
                    alt: altFormMap[altSuffix] || this.capitalize(altSuffix),
                };
            }
        },
    },
    created() {
        this.fetchData();
    },
    beforeRouteUpdate(to, from, next) {
        this.fetchData(to);
        next();
    },
};
</script>
