<script lang="ts">
    import { Sparkles, TriangleAlert } from "@lucide/svelte"
    import { loginOrRegister } from "./login.remote"
    import { Button, Form, TextInput, ValidationWarning } from "concept3"
</script>
<style lang="scss">
    @use "concept3/c3.scss";
    @use "#lib/palette.scss" as palette;
    div.main {
        display: flex;
        flex-direction: column;
        gap: .5em;
        max-width: 25em;
        margin: auto;
        align-items: stretch;
        h1 {
            text-align: center;
        }
    }
</style>
<Form remote={loginOrRegister}>
    <div class="main">
        <p>
            <em><Sparkles />Sparkles</em> lets you pay for arcade games at satoRGC's displays.
            You'll need to log in to use it.
        </p>
        {#each [
            ...(loginOrRegister.result?.success === false ? [loginOrRegister.result] : [])
        ] as issue}
            <div class="message c3-subpalette-negative">
                <TriangleAlert />
                <p>
                    {issue.message}
                </p>
            </div>
        {/each}
        <ValidationWarning on={loginOrRegister.fields.studentId}>
            <TextInput {...loginOrRegister.fields.studentId.as('text')} placeholder="Student ID" />
        </ValidationWarning>
        <TextInput {...loginOrRegister.fields.lastName.as('text')} autocomplete="family-name" placeholder="Your last name" />
        <Button text="Log in" />
    </div>
</Form>