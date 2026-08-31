<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Plus, X } from 'lucide-vue-next';
import { skillService } from '@/app/skill/services/skill.service';
import type { SkillResponse } from '@/app/skill/model/skill.response';

const props = withDefaults(defineProps<{
    id: string;
    label: string;
    hint?: string;
    placeholder?: string;
    disabled?: boolean;
}>(), {
    hint: '',
    placeholder: 'Escribe una habilidad',
    disabled: false,
});

const selectedSkills = defineModel<string[]>({ required: true });
const query = ref('');
const catalog = ref<SkillResponse[]>([]);
const loading = ref(false);
const loadError = ref(false);

const listId = computed(() => `${props.id}-suggestions`);
const normalizedSelection = computed(() => new Set(selectedSkills.value.map((skill) => skill.trim().toLocaleLowerCase())));
const suggestions = computed(() => {
    const needle = query.value.trim().toLocaleLowerCase();
    if (!needle) return catalog.value.slice(0, 8);
    return catalog.value
        .filter((skill) => skill.name.toLocaleLowerCase().includes(needle))
        .slice(0, 8);
});

function addSkill(value = query.value): void {
    const name = value.trim();
    if (!name || normalizedSelection.value.has(name.toLocaleLowerCase())) return;
    selectedSkills.value = [...selectedSkills.value, name];
    query.value = '';
}

function removeSkill(skillToRemove: string): void {
    selectedSkills.value = selectedSkills.value.filter((skill) => skill !== skillToRemove);
}

onMounted(async () => {
    loading.value = true;
    loadError.value = false;
    try {
        catalog.value = await skillService.getAll();
    } catch (error) {
        console.error('No se pudo cargar el catálogo de habilidades:', error);
        loadError.value = true;
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="skill-picker">
        <label :for="id" class="skill-label">{{ label }}</label>
        <p v-if="hint" class="skill-hint">{{ hint }}</p>

        <div class="skill-entry">
            <input
                :id="id"
                v-model="query"
                type="text"
                :list="listId"
                :placeholder="placeholder"
                :disabled="disabled"
                autocomplete="off"
                @keydown.enter.prevent="addSkill()"
            />
            <button type="button" :disabled="disabled || !query.trim()" @click="addSkill()">
                <Plus :size="17" aria-hidden="true" />
                <span>Añadir</span>
            </button>
        </div>

        <datalist :id="listId">
            <option v-for="skill in suggestions" :key="skill.id" :value="skill.name" />
        </datalist>

        <p v-if="loading" class="catalog-status" role="status">Cargando habilidades disponibles…</p>
        <p v-else-if="loadError" class="catalog-status catalog-status--error">
            No se pudo cargar el catálogo. Puedes añadir una habilidad manualmente.
        </p>

        <ul v-if="selectedSkills.length" class="skill-list" aria-label="Habilidades seleccionadas">
            <li v-for="skill in selectedSkills" :key="skill" class="skill-chip">
                <span>{{ skill }}</span>
                <button type="button" :disabled="disabled" :aria-label="`Quitar ${skill}`" @click="removeSkill(skill)">
                    <X :size="14" aria-hidden="true" />
                </button>
            </li>
        </ul>
    </div>
</template>

<style scoped>
.skill-picker { display: grid; gap: 8px; min-width: 0; }
.skill-label { color: var(--color-text-primary); font-size: var(--fs-body-sm); font-weight: var(--fw-semibold); }
.skill-hint, .catalog-status { margin: 0; color: var(--color-text-secondary); font-size: var(--fs-caption); line-height: 1.45; }
.catalog-status--error { color: var(--color-state-error-dark); }
.skill-entry { display: flex; gap: 10px; align-items: stretch; }
.skill-entry input { flex: 1; min-width: 0; min-height: 48px; padding: 0 14px; color: var(--color-text-primary); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-input); font: inherit; }
.skill-entry input:focus { outline: 3px solid rgba(40, 56, 211, .18); outline-offset: 1px; border-color: var(--color-primary); }
.skill-entry button { min-height: 46px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0 15px; border: 0; border-radius: var(--radius-button); color: #fff; background: var(--color-primary); font: inherit; font-size: var(--fs-body-sm); font-weight: var(--fw-semibold); cursor: pointer; }
.skill-entry button:hover:not(:disabled) { background: var(--color-primary-dark); }
.skill-entry button:focus-visible, .skill-chip button:focus-visible { outline: 3px solid rgba(40, 56, 211, .3); outline-offset: 2px; }
.skill-entry button:disabled, .skill-chip button:disabled { opacity: .55; cursor: not-allowed; }
.skill-list { display: flex; flex-wrap: wrap; gap: 8px; padding: 0; margin: 2px 0 0; list-style: none; }
.skill-chip { display: inline-flex; align-items: center; gap: 5px; min-width: 0; padding: 6px 7px 6px 10px; border-radius: 8px; color: var(--color-primary); background: var(--color-ai-bg); border: 1px solid var(--color-ai-outline); font-size: var(--fs-caption); font-weight: var(--fw-semibold); overflow-wrap: anywhere; }
.skill-chip button { display: inline-grid; place-items: center; width: 24px; height: 24px; padding: 0; border: 0; border-radius: 6px; color: currentColor; background: transparent; cursor: pointer; }
.skill-chip button:hover:not(:disabled) { background: rgba(40, 56, 211, .12); }
@media (max-width: 520px) { .skill-entry { flex-direction: column; } .skill-entry button { width: 100%; } }
</style>
