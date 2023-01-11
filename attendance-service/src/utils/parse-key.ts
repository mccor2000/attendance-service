export const parseKeyField = (initial: string): [string, string] => {
    if (initial.length <= 2) throw new Error('Key length must be greater than 2')

    return [
        initial.slice(0, initial.length - 2),
        initial.slice(-2)
    ]
}