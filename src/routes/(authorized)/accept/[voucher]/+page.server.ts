import { redeem, VoucherNotFoundError } from '#lib/server/voucher.js';

export async function load({locals, params}) {
    return await redeem(params.voucher, locals.user!.id)
            .then(({newBalance}) => ({success: true, newBalance}))
            .catch(e => {
                if (e instanceof VoucherNotFoundError)
                    return {success: false}
                throw e
            })
}