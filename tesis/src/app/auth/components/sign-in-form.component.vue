<script lang="ts">
    import { ref } from 'vue';

    defineOptions({
        name: "SignInFormComponent"
    });

    const username = ref("");
    const password = ref("");

    function OnSignIn(){
        //Logic for sign-in
    }

</script>

<template>
    <div class="form-container">
        <form class="sign-in-form">
            <input type="email" placeholder="Email" v-model="username" />
            <input type="password" placeholder="Password" v-model="password" />
            <button type="submit">Sign In</button>
        </form>
    </div>
</template>

<style scoped>

</style>