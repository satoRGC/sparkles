<script lang="ts">
    import VoucherCode from "#lib/qr/VoucherCode.svelte"
    import {page} from "$app/state"
    import { Button } from "concept3"
</script>
<svelte:head>
    <meta name="robots" content="noindex nofollow">
</svelte:head>
<style>
    :root {
        background-color: white;
    }
    button {
        display: contents;
        :global(*) {
            cursor: pointer;
        }
    }
</style>
<div class="centered-page">
    <button onclick={() => window.close()}>
        <VoucherCode voucherId={page.params.voucher!} --max-width="min(100vw, 100vh)" />
    </button>
</div>