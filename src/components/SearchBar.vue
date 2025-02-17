<template>
    <v-autocomplete v-model="internalQuery" :items="suggestions" label="Search by Name" outlined clearable hide-no-data
        @keyup.enter="submitSearch">
        <template v-slot:append>
            <v-icon @click="submitSearch" class="cursor-pointer">
                mdi-magnify
            </v-icon>
        </template>
    </v-autocomplete>
</template>

<script>
export default {
    name: "SearchBar",
    props: {
        value: {
            type: String,
            default: "",
        },
        suggestions: {
            type: Array,
            default: () => [],
        },
    },
    computed: {
        internalQuery: {
            get() {
                return this.value;
            },
            set(newValue) {
                this.$emit("input", newValue);
            },
        },
    },
    methods: {
        submitSearch() {
            this.$emit("search", this.internalQuery);
        },
    },
};
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}
</style>