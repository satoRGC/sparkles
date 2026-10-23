<script lang="ts">
    import { Broom, Check, QrCode } from "@lucide/svelte"
    import { Button, Form, NumberInput, Image } from "concept3"
    import { createVoucher, purgeVouchers } from "./imburse.remote"
    import {ORIGIN} from "$app/env/public"
    import VoucherCode from "#lib/qr/VoucherCode.svelte"

</script>
<style lang="scss">
    .numberInputContainer {
        align-items: center;
        display: flex;
        flex-direction: column;
        > :global(*), :global(input) {
            font-size: 2rem;
            font-family: var(--C3-AUX-FONT);
            /* this is so finnicky but it makes it 2x the size */
            --button-padding: 0.75em;
        }
        :global(svg) {
            font-size: 1.5em;
        }
        label {
            margin: .5em ;
            font-size: var(--C3-FONT-SIZE-NORMAL);
        }
    }
    .page {
        display: flex;
        flex-direction: column;
    }
    .shortcutContainer {
        display: flex;
        margin: 1em;
        gap: .5em;
        >:global(*) {
            flex-grow: 1;
        }
    }
    .centered {
        display: flex;
        flex-direction: column;
        padding: 1em;
        align-items: center;
    }
    a {
        display: contents;
    }
</style>
<div class="page">
    <p>
        Make payouts to patrons for credits they purchase.
    </p>
    <Form remote={createVoucher}>
        <div class="shortcutContainer">
            {#each [10, 6, 4, 2] as ct}
                <Button text={ct.toString()} onclick={() => createVoucher.fields.amount.set(ct)} />
            {/each}
        </div>
        <div class="numberInputContainer">
            <NumberInput min={1} max={20} {...createVoucher.fields.amount.as('number', 1)} />
            <label>Sparkles</label>
            <Button icon={QrCode} text="Generate" appearance="primary" />
        </div>
        {#if createVoucher.result?.success}
            <div class="centered">
                <a href="/view/{createVoucher.result.voucherId}" target="_blank">
                    <VoucherCode voucherId={createVoucher.result.voucherId} />
                </a>
            </div>
        {/if}
    </Form>
    <div class="centered">
        <Form remote={purgeVouchers}>
            <Button {...(
                purgeVouchers.result?.success
                ? {
                    appearance: "primary",
                    text: `Deleted ${purgeVouchers.result.purged} expired vouchers`,
                    icon: Check
                }
                : {
                    text: "Purge expired",
                    icon: Broom
                }
            )} />
        </Form>
    </div>
</div>