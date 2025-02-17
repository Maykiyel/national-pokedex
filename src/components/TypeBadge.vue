<template>
    <div class="pokemon-types">
        <span v-for="(type, index) in types" :key="index" :class="`badge type-${type}`">
            {{ capitalize(type) }}
        </span>
    </div>
</template>

<script>
import capitalize from '@/mixins/mixin';

export default {
    name: "TypeBadge",
    mixins: [capitalize],
    props: {
        types: {
            type: Array,
            required: true,
        },
    },
};
</script>


<style scoped>
.pokemon-types {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.badge {
    padding: 4px 8px;
    border-radius: 4px;
    color: white;
    font-weight: semibold;
    text-align: center;
}

/* Type Colors */
.type-normal {
    background-color: #A8A77A;
}

.type-fire {
    background-color: #EE8130;
}

.type-water {
    background-color: #6390F0;
}

.type-electric {
    background-color: #F7D02C;
}

.type-grass {
    background-color: #7AC74C;
}

.type-ice {
    background-color: #96D9D6;
}

.type-fighting {
    background-color: #C22E28;
}

.type-poison {
    background-color: #A33EA1;
}

.type-ground {
    background-color: #E2BF65;
}

.type-flying {
    background-color: #A98FF3;
}

.type-psychic {
    background-color: #F95587;
}

.type-bug {
    background-color: #A6B91A;
}

.type-rock {
    background-color: #B6A136;
}

.type-ghost {
    background-color: #735797;
}

.type-dragon {
    background-color: #6F35FC;
}

.type-dark {
    background-color: #705746;
}

.type-steel {
    background-color: #B7B7CE;
}

.type-fairy {
    background-color: #D685AD;
}
</style>