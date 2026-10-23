<script lang="ts">
    import { Button, ContainerTooltip } from "concept3"
    import { getServices, liveHasObservers } from "../../services.remote"
    import { Eye, EyeClosed, EyeOff, Pencil, Plus, TriangleAlert } from "@lucide/svelte"
    import { page } from "$app/state"
    import {GATEWAY} from "$app/env/public"
    import type { Intent, ServerEvent } from "#lib/server/ws.ts"

    let ws = $state<WebSocket>()
    let observing: Record<string, Awaited<ReturnType<typeof getServices>>[number]> = $state({})
    let observations: (ServerEvent)[] = $state([])
    let services = getServices();

    function startObservationWebsocketIfNeeded() {
        if (ws && ws.readyState === WebSocket.OPEN) return
        ws = new WebSocket(GATEWAY)
        ws.onclose = (e) => {
            observing = {}
            observations = []
        }
        ws.onmessage = (m) => observations.splice(0, 0, JSON.parse(m.data))
        return new Promise((res) => ws!.addEventListener("open", res, {once: true}))
    }

    async function observe(id: number) {
        const selected = (await services).find(e => e.id === id);
        if (!selected) return

        await startObservationWebsocketIfNeeded()
        observing[id] = selected
        ws!.send(JSON.stringify({
            intent: "observe",
            // lol this is awful
            id, token: selected.authenticationKey!
        } satisfies Intent))
    }
    
</script>
<style lang="scss">
    @use "concept3/c3.scss";
    .service, .hbox {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .service {
        @extend %c3-std-panel;
        list-style: none;
        flex-wrap: wrap;
        p {
            margin: 0;
        }
        div:not(.message) {
            display: flex;
            gap: 0.5em;
            align-items: center;
        }
        .message {
            flex-basis: 100%;
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
<div class="hbox">
    <p>
        Manage services.
    </p>
    <!-- this is really broken! i should fix it at some point -->
    <Button text="Add" icon={Plus} href="/services/new" appearance="primary" />
</div>
<ul>
    {#each await services as service}
        <li class="service">
            <div>
                <p>{service.name}</p>
            </div>
            <div>
                <Button {...(
                    observing[service.id]
                    ? { icon: Eye, text: "Observing", disabled: true }
                    : { icon: EyeClosed, text: "Observe" }
                )} onclick={() => observe(service.id)} />
                <Button text="Edit" icon={Pencil} appearance="primary" href="/services/{service.id}"/>
            </div>
            {#if !(await liveHasObservers(service.id))}
                <div class="c3-subpalette-negative message">
                    <TriangleAlert />
                    <p>There is no observer connected to this service and users will not be able to pay for it.</p>
                </div>
            {/if}
        </li>
    {/each}
</ul>
{#if Object.keys(observing).length}
    <div class="hbox">
        <p>Observations are listed below.</p>
        <Button icon={EyeOff} text="Stop observing" onclick={() => ws?.close()} />
    </div>
    <ul>
        {#each observations as observation}
            <li class="service">
                <p>{observing[observation.service].name}</p>
                <p>{new Date(observation.t).toTimeString()}</p>
            </li>
        {/each}
    </ul>
{/if}