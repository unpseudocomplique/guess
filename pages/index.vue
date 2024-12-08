<template>
    <div class="page">
        <div class="flex gap-2 justify-between flex-wrap">
            <h1 class="text-xl font-bold uppercase">Trouve le mot</h1>
            <UTooltip :text="wordToGuess">
                <UButton @click="initGame">Chercher un autre mot</UButton>
            </UTooltip>
        </div>
        <div class="flex gap-2">

            <UInput v-model="currentGuess" @keydown.enter="submitGuess" placeholder="Entrez un mot" />
            <UButton trailing-icon="i-lucide-arrow-right" @click="submitGuess">Valider</UButton>
        </div>
        <p v-if="error" class="text-red-500">{{ error }}</p>
        <u-card class="self-start w-96 max-w-full bg-linear-to-r/oklch from-indigo-500 to-teal-400">
            <h2>Tentatives :</h2>
        </u-card>
        <ul class="w-full flex flex-col gap-2" v-auto-animate>
            <li class="grow" v-for="(attempt, index) in attempts" :key="attempt.display">
                <game-answer :answer="attempt" />
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const { triggerSideCannons } = useConfetti();

interface Attempt {
    display: string;
    similarity: number;
    win?: boolean;
    message?: string;
}

const currentGuess = ref<string>('');
const attempts = ref<Attempt[]>([]);
const error = ref<string | null>(null);

const wordToGuess = ref<string>('');

async function initGame(firstInit = false) {
    error.value = null;
    attempts.value = [];
    currentGuess.value = '';

    const res = await $fetch<{ message: string; debugTarget: string }>('/api/init', {
        method: 'GET',
        query: { firstInit }
    });
    console.log('Debug target word (dev only):', res.debugTarget);
    wordToGuess.value = res.debugTarget;
}

async function submitGuess() {
    error.value = null;
    if (!currentGuess.value) return;

    const alreadyGuessed = attempts.value.some(a => a.display === currentGuess.value);
    if (alreadyGuessed) {
        error.value = 'Vous avez déjà tenté ce mot.';
        new Promise(resolve => setTimeout(resolve, 2000)).then(() => error.value = null);
        return;
    }

    const res = await $fetch('/api/guess', {
        method: 'POST',
        body: { guess: currentGuess.value }
    }) as { guess: string; similarity: number; win: boolean; message?: string };

    if (res.error) {
        error.value = res.error;
        // sleep 
        new Promise(resolve => setTimeout(resolve, 2000)).then(() => error.value = null);
        return;
    }

    console.log('res', res)
    attempts.value.unshift({
        display: res.guess ?? '',
        similarity: res.similarity,
        win: res.win,
        message: res.message
    });

    if (res.win) {
        triggerSideCannons()
    }
    new Promise(resolve => setTimeout(resolve, 2000)).then(() => attempts.value.sort((a, b) => b.similarity - a.similarity));
    currentGuess.value = '';
}

initGame(true);
</script>