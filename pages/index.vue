<template>
    <div class="flex flex-col gap-4 items-start">
        <h1 class="text-xl font-bold uppercase">Trouve le mot</h1>
        <button @click="initGame">Chercher un autre mot</button>
        <div class="flex gap-2">

            <UInput v-model="currentGuess" @keydown.enter="submitGuess" placeholder="Entrez un mot" />
            <UButton trailing-icon="i-lucide-arrow-right" @click="submitGuess">Valider</UButton>
        </div>
        <p v-if="error" style="color:red;">{{ error }}</p>
        <h2>Tentatives :</h2>
        <ul class="w-full flex flex-col gap-2">
            <li class="grow" v-for="(attempt, index) in attempts" :key="index">
                <game-answer :answer="attempt" />
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Attempt {
    guess: string;
    similarity?: number;
    win?: boolean;
    message?: string;
}

const currentGuess = ref<string>('');
const attempts = ref<Attempt[]>([]);
const error = ref<string | null>(null);

async function initGame() {
    error.value = null;
    attempts.value = [];
    currentGuess.value = '';

    const res = await $fetch<{ message: string; debugTarget: string }>('/api/init', {
        method: 'GET'
    });
    console.log('Debug target word (dev only):', res.debugTarget);
}

async function submitGuess() {
    error.value = null;
    if (!currentGuess.value) return;

    const res = await $fetch('/api/guess', {
        method: 'POST',
        body: { guess: currentGuess.value }
    }) as { error?: string; guess?: string; similarity?: number; win?: boolean; message?: string };

    if (res.error) {
        error.value = res.error;
    } else {

        console.log('res', res) 
        attempts.value.push({
            display: res.guess ?? '',
            similarity: res.similarity,
            win: res.win,
            message: res.message
        });

        if (res.win) {
            alert("Bravo ! Vous avez trouvé le mot !");
        }
    }
    currentGuess.value = '';
}
</script>