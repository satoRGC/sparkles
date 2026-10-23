<script lang="ts">
    import { page } from "$app/state"
    import { CircleCheck, CircleX, Sparkles, type LucideIcon } from "@lucide/svelte"
    import { getServices } from "../../services.remote"
    import { error } from "@sveltejs/kit"
    import { Spring } from "svelte/motion"    
    import { GATEWAY } from "$app/env/public"
    import { onMount } from "svelte"
    import type { Intent, ServerEvent } from "#lib/server/ws.ts"

    let service = (await getServices(page.params.service)).at(0);
    let affordable = $derived(service && parseFloat(page.data.user!.balance) >= parseFloat(service.basePrice))
    
    let tracking: boolean = $state(false)
    let left = new Spring<number>(0, {stiffness: 0.5, damping: 1})
    let sliderbox = $state<HTMLButtonElement>()
    let sliderboxScreenX = 0;
    let sliderboxMax = 0;

    let wsMessage: ServerEvent | undefined = $state()
    let wsClose: CloseEvent | undefined = $state()
    let loading = $state(false)
    
    let ws: WebSocket;

    function setupWebSocket() {
        // This allows us to set up preconnecting to the ws
        ws = "ws" in window ? window.ws as WebSocket : new WebSocket(GATEWAY)
        //@ts-ignore
        window.ws = ws
        ws.onclose = (e) => wsClose = e
        ws.onmessage = (m) => wsMessage = JSON.parse(m.data)
    }

    async function makePayment() {
        console.log("Stalling")
        if (ws.readyState !== WebSocket.OPEN)
                await new Promise((res) => ws.addEventListener("open", res, {once: true}))
        
        console.log("Making payment")
        ws.send(JSON.stringify({
            intent: "pay",
            id: service!.id
        } satisfies Intent))
    }
    
    onMount(() => {
        if (affordable)
            setupWebSocket()
    })

    // BAD BAD BAD BAD BAD BAD BAD DO NOT DO THIS

    $effect(() => {
        if ((left.target / sliderboxMax) > 0.95) {
            if (!loading)
                makePayment()
            loading = true;
            left.set(sliderboxMax)
        }
    })

    // this is bad but it's only being used in this project so IDC
    function onpointermove(e: PointerEvent) {
        if (loading) return
        if (tracking)
            left.set(Math.max(Math.min(e.screenX - sliderboxScreenX, sliderboxMax), 0))
    }
    function onpointerup() {
        if (loading) return
        tracking = false
        left.set(0)
    }
    function onpointerdown() {
        if (loading || tracking) return
        tracking = true
        let buttonRect = sliderbox?.getBoundingClientRect()!
        let sliderRect = sliderbox?.parentElement?.getBoundingClientRect()!
        let pad = buttonRect.left - sliderRect.left
        sliderboxScreenX = buttonRect.left
        sliderboxMax = sliderRect.width - buttonRect.width - (2*pad)
    }
</script>
<svelte:head>
    {#if affordable}
        <!-- start pre-connecting while loading other stuff -->
        {@html `<script type="module">if (!window.ws) window.ws = new WebSocket(\`${GATEWAY}\`)</script>`}
    {/if}
</svelte:head>
<style lang="scss">
    @use "concept3/c3.scss";
    .centered-page {
        color: var(--C3-PALETTE-BACKGROUND-TEXT);
    }
    p, h1 {
        margin: 0 !important;
    }
    .purchase h1 {
        font-size: var(--C3-FONT-SIZE-REGULAR);
        font-weight: normal;
    }
    p.subtext {
        color: var(--C3-SUBTEXT);
    }
    .slider-c {
        position:absolute;
        left: 0%;
        top: 100%;
        transform: translateY(-100%);
        width: 100%;
        box-sizing: border-box;
        display: flex;
        padding: 1em;
    }
    .slider {
        width: 100%;
        @extend %c3-std-container;
        padding: .25em;
        display: flex;
        align-items: center;
        gap: 1em;
        color: var(--C3-SUBTEXT);
        position: relative;
        .handle {
            @extend %c3-std-input-base;
            @extend %c3-std-handle;
            @extend %has-interaction-animations;
            @extend %primary;
            width: 3.5em;
            height: 2.5em;
            cursor: grab;
            z-index: 1;
        }
    }
    .slider.loading {
        @include c3.std-shimmer;
        &.shiny {
            opacity: 0;
            transition-duration: 100ms;
        }
    }

    @keyframes shiny {
        0% {
            background-position: 150% 0%;
        }
        100% {
            background-position: 0% 0%;
        }
    }
    .shiny {
        position: absolute;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, transparent 40%, #fff1, transparent 60%) 100% 100% / 240% 240%;
        animation: 2s infinite shiny;
        animation-fill-mode:none;
        pointer-events: none;
        z-index: 2;
    }

</style>
<svelte:body {onpointerup} {onpointermove}/>
{#snippet payment_page()}
    <div class="centered-page purchase">
        <h1>{service?.wording === "activation" ? "Activating" : "Redeeming sparkles for"} <strong>{service?.name}</strong></h1>
        <div class="cost">
            {service?.basePrice}
            <Sparkles />
        </div>
        <p class="subtext">
            you have <strong>{page.data.user!.balance} <Sparkles /></strong>
        </p>
        <div class="slider-c">
            <div class={["slider", "c3-burrow", loading ? "loading" : undefined]}>
                <button class="handle" aria-label="Handle" bind:this={sliderbox} {onpointerdown} style:transform="translateX({left.current}px)"></button>
                <span>
                    slide to {service?.wording === "activation" ? "activate" : "redeem"}
                </span>
                <div class="shiny"></div>
            </div>
        </div>
    </div>
{/snippet}
{#snippet error_page(header: string|number, context: string)}
<div class="centered-page c3-subpalette-negative">
    <CircleX width="5em" height="5em" />
    <h1>{header}</h1>
    <p>{context}</p>
</div>
{/snippet}
{#if affordable}
    {#if wsMessage}
        <div class="centered-page c3-subpalette-success">
            <CircleCheck width="5em" height="5em" />
            <h1>Done</h1>
            <p>Your new balance is {wsMessage.newBalance} <Sparkles /></p>
        </div>
    {:else}
        {#if wsClose}
            {@render error_page(wsClose.code, wsClose.reason)}
        {:else}
            {@render payment_page()}
        {/if}
    {/if}
{:else}
    <div class="centered-page c3-subpalette-negative">
        <CircleX width="5em" height="5em" />
        <h1>Insufficient balance</h1>
        <p>You don't have enough Sparkles.</p>
        <p class="subtext">Requires {service?.basePrice} <Sparkles />, but you have {page.data.user!.balance} <Sparkles /></p>
    </div>
{/if}