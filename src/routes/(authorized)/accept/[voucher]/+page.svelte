<script lang="ts">
    import { CircleCheck, CircleX, Sparkles } from "@lucide/svelte"

    let {data} = $props()
</script>
<style lang="scss">
    .centered-page {
        color: var(--C3-PALETTE-BACKGROUND-TEXT);
    }
    p, h1 {
        margin: 0 !important;
    }
    .c3-subpalette-negative :root {
        background: var(--C3-PALETTE-BACKGROUND)
    }
</style>
{#if data.success}
    <div class={['centered-page', 'c3-subpalette-success']}>
        <CircleCheck width="5em" height="5em" />
        <h1>Added funds</h1>
        <p>Your balance is now {data.newBalance} <Sparkles />.</p>
    </div>
{:else}
    <div class={['centered-page', 'c3-subpalette-negative']}>
        <CircleX width="5em" height="5em" />
        <h1>Invalid link</h1>
        <p>
            Please speak with an officer. If you have already added funds from this page,
            you can ignore this message.
        </p>
    </div>
{/if}