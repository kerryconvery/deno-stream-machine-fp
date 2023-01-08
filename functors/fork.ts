type ForkFn<T> = () => T
export function fork<T>(condition: boolean, leftFn: ForkFn<T>, rightFn: ForkFn<T>): T {
    if (condition) {
        return rightFn()
    }
    return leftFn()
}