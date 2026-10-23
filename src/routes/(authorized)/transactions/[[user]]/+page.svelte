<script lang="ts">
    import { ArrowLeft, Sparkles, Undo } from "@lucide/svelte"
    import { Button, Form } from "concept3"
    import { getTransactions, undoTransaction } from "./transactions.remote"
    import relativeTime from "./relativeTime"

    let {data} = $props()

</script>
<style lang="scss">
    @use "concept3/c3.scss";
    .transaction {
        @extend %c3-std-panel;
        display: flex;
        flex-direction: column;
        list-style: none;
        .metadata {
            font-weight: 600;
            font-size: var(--C3-FONT-SIZE-SMALL);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .important {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        p {
            margin: 0;
        }
    }
    ul {
        display: flex;
        flex-direction: column;
        padding: 0;
        margin: 0;
        gap: .5em;
    }
</style>
<Button icon={ArrowLeft} text="Back" appearance="primary" href={data.target === data.user!.id ? "/" : "/users"}/>
<p>
    Showing last <strong>50</strong> transactions for {data.target}.
</p>
<ul>
{#each await getTransactions(data.target) as tx}
    <li class="transaction">
        <span class="metadata">
            {relativeTime((tx.timestamp.getTime() - Date.now()) / 1000)}
            {#if data.user!.admin}
                <Form remote={undoTransaction.for(tx.id)}>
                    <Button text="Undo" icon={Undo} />
                </Form>
            {/if}
        </span>
        <div class="important">
            <p>
                {#if tx.reason}
                    {tx.reason}
                {:else}
                    <em>Unknown</em>
                {/if}
            </p>
            <span>{tx.amount.startsWith("-") ? tx.amount : `+${tx.amount}`} <Sparkles /></span>
        </div>
    </li>
{:else}
    <em>You haven't made any transactions</em>
{/each}
</ul>