<script>
    import { Broom, CreditCard, Eye, KeyRound, Minus, Search, UserX } from "@lucide/svelte"
    import { Button, Form, TextInput, ValidationWarning } from "concept3"
    import { adminGetUser, adminGetUserForm, changeOwnPwd, resetPwd, zeroUserBal } from "./users.remote"
    import { id } from "zod/locales"
    import { page } from "$app/state"

</script>
<p>
    User administrative actions.
</p>
<Form remote={adminGetUserForm}>
    <TextInput placeholder="Student ID" {...adminGetUserForm.fields.id.as("text")} /> <Button appearance="primary" text="Find" icon={Search} />
</Form>
{#if adminGetUserForm.result?.id}
    <fieldset>
        <legend>{adminGetUserForm.result.id}</legend>
        <div>
            <strong>{(await adminGetUser(adminGetUserForm.result.id)).balance}</strong> Sparkles
            <Button icon={CreditCard} text="Transactions" href="/transactions/{adminGetUserForm.result.id}"/>
            <span class="c3-subpalette-negative">
                <Form remote={zeroUserBal.for(adminGetUserForm.result.id)}>
                    <Button icon={Minus} text="Zero"/>
                </Form>
            </span>
        </div>
        <details>
            <summary>Dangerous</summary>
            <Form remote={resetPwd.for(adminGetUserForm.result.id)}>
                <span class="c3-subpalette-negative">
                    <Button icon={KeyRound} text="Reset password"/>
                </span>
            </Form>
            {#if adminGetUserForm.result.id === page.data.user.id}
                <Form remote={changeOwnPwd}>
                    <ValidationWarning on={changeOwnPwd.fields.newPwd}>
                        <TextInput placeholder="password" {...changeOwnPwd.fields.newPwd.as("text")} />
                    </ValidationWarning>
                    <Button icon={KeyRound} text="Change own password"/>
                </Form>
            {/if}
        </details>
    </fieldset>
{/if}