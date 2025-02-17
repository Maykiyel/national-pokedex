<template>
    <v-select v-model="internalValue" :items="sortOptions" label="Sort By" dense outlined class="sort-dropdown" />
</template>

<script>
export default {
    name: "SortBar",
    props: {
        // We want two-way binding, so we use v-model
        value: {
            type: String,
            default: "",
        },
        sortOptions: {
            type: Array,
            default: () => [],
        },
    },
    computed: {
        // Use a computed property to implement v-model
        internalValue: {
            get() {
                return this.value;
            },
            set(newVal) {
                // Emit input event so the parent can update
                this.$emit("input", newVal);
            },
        },
    },
};
</script>

<style scoped>
.sort-dropdown {
    width: 250px;
}
</style>