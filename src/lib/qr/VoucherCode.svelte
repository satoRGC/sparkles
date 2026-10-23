<script lang="ts">
    import {ORIGIN} from "$app/env/public"
    interface Props {
        voucherId: string
    }
    const {voucherId}: Props = $props()
</script>
<img
    src={
        await (await import("./qrcode")).toDataURL(
            new URL(
                `/accept/${voucherId}`,
                ORIGIN
            ).toString()
        )
    }
    alt=""
    style="width: 100%;max-width: var(--max-width, 20em);aspect-ratio: 1;"
/>