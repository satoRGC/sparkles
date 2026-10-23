import { getRequestEvent } from "$app/server";
import { error } from "@sveltejs/kit";
import type { User } from "./db";

export class UserRequirementBuilder<T extends User = User> {
    private readonly conditions: ((u: User)=>boolean|Promise<boolean>)[] = []
    then(fulfill: (a: PromiseLike<T>) => void, reject: () => void) {
        fulfill(this.getUser())
    }
    async getUser() {
        const {locals: {user}} = getRequestEvent()
        if (!user)
            error(401, "Unauthorized")
        await Promise.all(
            this.conditions.map(async cond => {
                if (!(await cond(user)))
                    error(403, "Forbidden")
            })
        )
        return user as T
    }
    withAdmin() {
        this.conditions.push((u) => u.admin)
        return this as UserRequirementBuilder<T & { admin: true }>
    }
}
export function currentUser() {
    return new UserRequirementBuilder()
}