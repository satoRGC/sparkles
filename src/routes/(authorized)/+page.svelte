<script lang="ts">
    import { Button, Dropdown, Form } from 'concept3'
    import rgclogo from "#lib/logo.svg?raw"
    import { Calendar, Coins, CreditCard, LogOut, Sparkles, VectorPolygon } from '@lucide/svelte'
    import { logout } from './logout.remote'
    import { tools } from './(admin)/items'

    const {data} = $props()
</script>
<style lang="scss">
    @use "concept3/c3.scss";
    fieldset {
        margin: 1em 0;
    }
    a {
        @include c3.std-link;
    }
    .panel {
        @extend %c3-std-panel;
    }
    .center {
        display: flex;
        align-items: center;
        flex-direction: column;
        text-align: center;
    }
    .subtext {
        color: var(--C3-SUBTEXT)
    }
</style>
<p>
    Hi there, <strong>{data.user!.id}</strong>.
</p>
<div class="center">
    <span class="subtext">balance</span>
    <div class="cost">
        {data.user!.balance} <Sparkles />
    </div>
</div>
<p>
    See an officer if you'd like to add any Sparkles to your account.
</p>
<Form remote={logout}>
    <Button
        href="https://rhythmgames.atsa.to"
        text="Events"
        icon={Calendar}
        appearance="primary"
    />
    <Button
        href="/transactions"
        text="Transactions"
        icon={CreditCard}
    />
    <span class="c3-subpalette-negative">
        <Button
            text="Log out"
            icon={LogOut}
        />
    </span>
</Form>
{#if data.user!.admin}
    <form>
        <fieldset>
            <legend>Administration</legend>
            {#if data.user!.usingDefault}
                <div class="c3-subpalette-negative panel">
                    <p>
                        <strong>You need to update your password.</strong>
                        You can update your password by typing in your own student ID on the
                        <a href="/users"><em>Users</em></a>
                        page, then opening tools under <em>Dangerous</em>.
                    </p>
                    <p>
                        Once this is done, you will be able to log in by typing in your
                        set password instead of your last name on the login screen.
                    </p>
                </div>
                <br>
            {/if}
            {#each tools as tool}
                <Button {...tool} />&nbsp;
            {/each}
        </fieldset>
    </form>
{/if}