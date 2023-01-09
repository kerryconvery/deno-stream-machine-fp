type ForkFn<T> = () => T

type Fork<T> = {
    condition: boolean,
    left: ForkFn<T>,
    right: ForkFn<T>
}

export function fork<T>({ condition, left, right }: Fork<T> ): T {
    if (condition) {
        return right()
    }
    return left()
}