<script lang="ts">
    import { deleteService, getServices, putService } from "../../../services.remote"
    import { page } from "$app/state"
    import { Button, Form, InputSegmentedControl, NumberInput, Textarea, TextInput, ValidationWarning } from "concept3"
    import { ArrowLeft, Check, Copy, Save, Tag, Trash } from "@lucide/svelte"
    import { ORIGIN } from "$app/env/public"
    import type { RemoteFormField } from "$app/server"
    
    let remote = $derived(
        putService.for(typeof page.params.service === "number" ? page.params.service : "_")
    )
    let past = $derived(
        typeof page.params.service === "number" ? getServices(page.params.service) : undefined
    )
</script>
<style lang="scss">
    @use "concept3/c3.scss";
    .topbar, .panel {
        display: flex;
        justify-content: space-between;
        align-items: center;
        > div {
            display: flex;
            gap: 0.5em;
        }
    }
    .panel {
        @extend %c3-std-panel;
    }
    .container {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
    }
</style>
<p>{page.params.service === "new" ? "Creating" : "Editing"} a service.</p>
<!-- the #key block here forces it to ACTUALLY change the resets= prop -->
{#key typeof page.params.service}
    <div class="container">
        <Form {remote} resets={page.params.service === "new"}>
            <div class="container">
                <div class="topbar">
                    <div>
                        <Button icon={ArrowLeft} text="Back" href="/services" />
                        <ValidationWarning on={remote.fields.name}>
                            <TextInput {...remote.fields.name.as("text", (await past)?.[0].name ?? "")} placeholder="Name" icon={Tag} />
                        </ValidationWarning>
                    </div>
                    <div>
                        <Button {...(
                            remote.result?.success
                            ? { icon: Check, text: "Saved" }
                            : { icon: Save, text: "Save" }
                        )} appearance="primary" />
                    </div>
                </div>
                <div class="panel">
                    <label>Base price</label>
                    {let defaultPrice = parseFloat((await past)?.[0].basePrice ?? "1")}
                    <ValidationWarning on={remote.fields.basePrice}>
                        <NumberInput min={1} step={[0.1, 1]} {...remote.fields.basePrice.as("number", defaultPrice)} />
                    </ValidationWarning>
                </div>
                <div class="panel">
                    <label>Authentication key</label>
                    <div>
                        <ValidationWarning on={remote.fields.authenticationKey}>
                            <Textarea {...remote.fields.authenticationKey.as("text", (await past)?.[0].authenticationKey ?? crypto.randomUUID())} />
                        </ValidationWarning>
                        <Button icon={Copy} onclick={() => {
                            navigator.clipboard.writeText(remote.fields.authenticationKey.value() || '')
                        }} />
                    </div>
                </div>
                <div class="panel">
                    <p>Wording</p>
                    <ValidationWarning on={remote.fields.wording}>
                        <InputSegmentedControl {...remote.fields.wording.as('text', (await past)?.[0].wording ?? "activation")} options={[
                            { text: "Activation", value: "activation" },
                            { text: "Redemption", value: "redemption" }
                        ]} />
                    </ValidationWarning>
                </div>
            </div>
        </Form>
        {#if page.params.service !== "new"}
            <div class="panel">
                <p>Pay link</p>
                {let payLink = new URL(`/pay/${(await past)?.[0].id}`, ORIGIN).toString()}
                <div>
                    <p>
                        {payLink}
                    </p>
                    <Button icon={Copy} onclick={() => {
                        navigator.clipboard.writeText(payLink)
                    }} />
                </div>
            </div>
            <div class="panel">
                <label>Delete service</label>
                <Form remote={deleteService.for(page.params.service!)}>
                    <div class="c3-subpalette-negative">
                        <Button icon={Trash} text="Delete" />
                    </div>
                </Form>
            </div>
        {/if}
    </div>
{/key}