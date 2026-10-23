export async function load({params, parent}) {
    return {
        target: params.user || (await parent()).user!.id
    }
}