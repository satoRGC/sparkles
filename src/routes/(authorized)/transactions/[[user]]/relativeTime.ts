const formatter = new Intl.RelativeTimeFormat("en-US", {
    numeric: "always",
    style: "long"
})

/**
 * Sizes of each unit for Intl.RelativeTimeFormat in seconds
 */
const unitMap: [number, Intl.RelativeTimeFormatUnit][] = [
    [1, "second"],
    [60, "minute"],
    [60*60, "hour"],
    [60*60*24, "day"],
    [60*60*24*7, "week"],
    [60*60*24*30, "month"]
]

/**
 * get relative time string for a relative time
 * @param t time in seconds
 */
export default function relativeTime(t: number) {
    const tAbs = Math.abs(t)
    const withinUnit = unitMap.findIndex(([sz]) => tAbs <= sz)
    // get the largest unit that fits within t,
    // if smaller than the smallest unit we get the smallest unit
    // if larger than the largest unit we get the largest unit
    const [ unitSize, unitName ] = unitMap[withinUnit-1] ?? unitMap[withinUnit] ?? unitMap.at(-1)
    // might be better for the "in x weeks" cutoff to be at like, 10 days tbh 
    return formatter.format(Math.round(t / unitSize), unitName)
}