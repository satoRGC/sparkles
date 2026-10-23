import { CANVAS_API_BASE, CANVAS_API_KEY, COURSE_ID, SIS_SUFFIX } from "$app/env/private"

export class CanvasUserNotFoundError extends Error {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options)
    }
}

export interface CanvasUserView {
    /** First Last */
    name: string,
    /** Last, First */
    sortable_name: string,
    /** Canvas user ID */
    id: number
}

export async function fetchUserFromCanvas(studentId: string): Promise<CanvasUserView> {
    const response = await fetch(
        new URL(
            `courses/${COURSE_ID}/users/sis_login_id:${encodeURIComponent(studentId)}${SIS_SUFFIX}`,
            CANVAS_API_BASE,
        ),
        {
            headers: {
                "Authorization": `Bearer ${CANVAS_API_KEY}`
            }
        }
    )

    if (!response.ok) {
        if (response.status === 404)
            throw new CanvasUserNotFoundError(`${studentId} is unknown`)
        throw new Error(`Other unknown error`, { cause: response })
    }

    return response.json()
}