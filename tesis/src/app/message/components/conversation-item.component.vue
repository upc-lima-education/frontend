<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
    id: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: false },
    userImage: { type: String, required: false },
    unreadCount: { type: Number, default: 0 },
    active: { type: Boolean, default: false }
});

const image = computed(() => props.userImage || "src/app/shared/assets/icons/UsuarioPredeterminado.svg");
</script>

<template>
<div class="item" :class="{ active }">
    <div class="avatar">
        <img draggable="false" :src="image" alt="userImage">
    </div>
    <div class="content">
        <div class="top">
            <h4 class="title">{{ title }}</h4>
            <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
        </div>
        <small v-if="subtitle" class="subtitle">{{ subtitle }}</small>
    </div>
</div>
</template>

<style scoped>
.item{
    display:flex;
    align-items:center;
    gap:12px;
    padding:10px 12px;
    cursor:pointer;
    border-bottom:1px solid var(--gray-02);
    transition:background 0.15s;
}

.item:hover{
    background:var(--background-color-light);
}

.item.active{
    background:var(--gray-02);
}

.avatar{
    flex-shrink:0;
}

.avatar img{
    width:44px;
    height:44px;
    border-radius:50%;
    object-fit:cover;
}

.content{
    flex:1;
    min-width:0;
    display:flex;
    flex-direction:column;
    gap:3px;
}

.top{
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:8px;
}

.title{
    color:var(--text-color-default);
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
}

.subtitle{
    color:var(--text-color-light);
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
}

.badge{
    background:var(--secondary-color);
    color:white;

    font-size:0.7rem;
    padding:2px 7px;
    border-radius:999px;
}

</style>