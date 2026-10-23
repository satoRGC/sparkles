<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';
	import { PageLayout } from "concept3"
	import "#lib/root.scss"

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<PageLayout>
	{@render children()}
</PageLayout>