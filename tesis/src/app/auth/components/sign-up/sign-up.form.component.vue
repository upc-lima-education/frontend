<script setup lang="ts">
import { ref } from 'vue';
import router from '@/app/shared/router';
const firstName = ref("");
const lastName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const areAllFieldsFilled = ref(true);
const doPasswordsMatch = ref(true);
const isPasswordValid = ref(true);
function OnSignUp() {
    areAllFieldsFilled.value = true;
    doPasswordsMatch.value = true;
    isPasswordValid.value = true;
    if(firstName.value === "" || lastName.value === "" || email.value === "" 
    || password.value === "" || confirmPassword.value === "") {
        areAllFieldsFilled.value = false;
        return;
    }
    if (password.value !== confirmPassword.value) {
        doPasswordsMatch.value = false;
        return;
    }
    if (!validatePassword(password.value)) {
        isPasswordValid.value = false;
        return;
    }
    router.push('/sign-in'); // temp
}

function validatePassword(pwd: string) {
    const re = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return re.test(pwd);
}
</script>

<template>
    <div class="sign-in-form-container">
        <header>
            <h1>{{ $t('auth.login') }}</h1>
        </header>
        <section>
            <form @submit.prevent="OnSignUp" class="default-form">
                <p v-if="!areAllFieldsFilled">{{ $t('auth.fillAllFields') }}</p>
                <p v-if="!doPasswordsMatch">{{ $t('auth.passwordsDoNotMatch') }}</p>
                <p v-if="!isPasswordValid">{{ $t('auth.passwordRequirements') }}</p>
                <section>
                    <label for="firstName">{{ $t('auth.firstName') }}</label>
                    <input id="firstName" type="text" placeholder="First Name" v-model="firstName" />
                    <label for="lastName">{{ $t('auth.lastName') }}</label>
                    <input id="lastName" type="text" placeholder="Last Name" v-model="lastName" />
                </section>
                <section>
                    <label for="email">{{ $t('auth.email') }}</label>
                    <input id="email" type="email" placeholder="Email" v-model="email" />
                </section>
                <section>
                    <label for="password">{{ $t('auth.password') }}</label>
                    <input id="password" type="password" placeholder="Password" v-model="password" />
                </section>
                <section>
                    <label for="confirmPassword">Confirm Password</label>
                    <input id="confirmPassword" type="password" placeholder="Confirm Password" v-model="confirmPassword" />
                </section>
                <section>
                    <input class="button-primary" type="submit" :value="$t('auth.signUp')" />
                    <div class="redirects-container">
                        <RouterLink to="/">{{ $t('auth.noAccount') }}</RouterLink>
                        <RouterLink to="/">{{ $t('auth.forgotPassword') }}</RouterLink>
                    </div>
                </section>
            </form>
        </section>
    </div>
</template>

<style scoped>
.redirects-container {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
}

.sign-in-form-container {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    gap: 2rem;
}

section {
    width: 100%;
}
</style>