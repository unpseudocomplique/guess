<script setup lang="ts">

const props = defineProps<{
 answer: {
    similarity: number;
    display: string;
    win: boolean;
 }
}>();

const currentValue = ref(0)


const output = useTransition(currentValue)

currentValue.value = Math.max(props.answer.similarity, 0)



</script>

<template>
  <UCard class="grow">
    <div class="flex gap-2">
      <h3 class="uppercase font-bold text-xl">{{ props.answer.display }} </h3>
      <UBadge v-if="answer.win" class="font-bold rounded-full">Gagné !</UBadge>
    </div>
    <UProgress v-model="output" :max="1" :min="0" color="primary" size="sm" />
  </UCard>
</template>
