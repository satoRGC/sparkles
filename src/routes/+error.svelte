<script lang="ts">
    import { page } from "$app/state"
    import { CircleX } from "@lucide/svelte"

    
</script>
<style lang="scss">
    .centered-page {
        color: var(--C3-SUBTEXT);
    }
    p, h1 {
        margin: 0 !important;
    }
</style>
<div class="centered-page">
    <CircleX width="5em" height="5em" />
    <h1>{page.error?.status}</h1>
    <p>{page.error?.message}</p>
</div>