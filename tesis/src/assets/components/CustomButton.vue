<script setup lang="js">
defineProps({
    buttonColor: {
        type: String,
        default: "primary",
        validator (value) {
            return ["primary", "secondary", "success", "danger", "info"].includes(value)
        } 
    },
    buttonText: {
        type: String,
        default: "Button",
        required: true
    },
    disabled: {
        type: Boolean,
        default: false
    },
    functionOnClick: {
        type: Function,
        default(){ "defaultClickBehavior" }
    }
});

function defaultClickBehavior(){
    console.log("Button clicked");
}

</script>

<template>
    <button :class="`button-${buttonColor}`" :disabled="disabled" @click="functionOnClick">
        {{ buttonText }}
    </button>
</template>

<style scoped>
button {
    font-weight: bold;
    color: white;
    width: 100%;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

button:disabled {
    background-color: var(--gray-05);
    cursor: not-allowed;
}

.button-primary {
    background-color: var(--main-color);
}

.button-primary:hover {
    background-color: var(--main-color-dark);
}

.button-secondary {
    background-color: var(--secondary-color);
}

.button-secondary:hover {
    background-color: var(--secondary-color-dark);
}

.button-success {
    background-color: var(--green-color);
}

.button-success:hover {
    background-color: var(--green-color-dark);
}

.button-danger {
    background-color: var(--red-color);
}

.button-danger:hover {
    background-color: var(--red-color-dark);
}

.button-info {
    background-color: var(--gray-05);
}

.button-info:hover {
    background-color: var(--gray-06);
}
</style>