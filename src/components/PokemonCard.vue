<template>
    <router-link :to="{ name: 'PokemonDetails', params: { id } }" class="text-decoration-none">
        <v-card elevation="2" class="pa-4 rounded-lg pokemon-card">
            <v-img :src="image" :alt="name" class="blue-grey darken-4 rounded-lg" height="256" contain></v-img>
            <v-card-subtitle class="pa-0">#{{ id }}</v-card-subtitle>
            <v-card-title class="pa-0">{{ capitalize(name) }}</v-card-title>
            <TypeBadge :types="getTypes" />
        </v-card>
    </router-link>
</template>

<script>
import TypeBadge from './TypeBadge.vue';
import capitalize from '@/mixins/mixin';

export default {
    name: 'PokemonCard',
    components: {
        TypeBadge,
    },
    mixins: [capitalize],
    props: {
        id: Number,
        name: String,
        image: String,
        types: Array,
    },
    computed: {
        getTypes() {
            return this.types;
        }
    },
};
</script>

<style scoped>
.pokemon-card {
    transition: transform 0.2s;
}

.pokemon-card:hover {
    transform: scale(1.05);
}

.pokemon-card:active {
    transform: scale(0.95);
}
</style>
