export async function sleep(ms: number) {
    await new Promise(r => setTimeout(r, ms))
}

export function getenv(key: string, fallback: string): string {
    const value = process.env[key]
    if (!value || value.length === 0 ) {
        return fallback;
    }
    return value;
}

export function compareString(a: string, b: string) {
    return a < b ? -1 : a > b ? 1 : 0;
}