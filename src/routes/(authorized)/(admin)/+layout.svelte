<script lang="ts">
    import { page } from "$app/state"
    import { Coins, House, Users, VectorPolygon } from "@lucide/svelte"
    import { LinkSegmentedControl } from "concept3";
    import { tools } from "./items"
    let {children} = $props();
</script>
<style lang="scss">
    @use "concept3/c3.scss";
    nav {
        width: 100%;
        display: flex;
        justify-content: center;
    }
</style>
<nav>
    {const options = [
        {text: "Userfacing",href: "/",icon:House},
        ...tools
    ]}
    <LinkSegmentedControl {options} selected={options.slice(1).find(e => page.url.pathname.startsWith(e.href))?.href} />
</nav>
{@render children()}