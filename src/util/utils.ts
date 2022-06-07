import {PortfolioState} from "../state/tracker_state";

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

export function describe(portfolio: PortfolioState, refillPercent: number, takeProfitPercent: number, currentValue: number = 0) {
    console.log(`Portfolio:`)
    if (currentValue) {
        console.log(`Current portfolio value: ${currentValue}`)
    }
    console.log(`Invested: ${portfolio.invested}`)
    console.log(`Target: ${portfolio.targetValue}`)
    console.log(`Refill multiplier: ${portfolio.refillMultiplier(portfolio.invested, portfolio.targetValue, refillPercent)}`)
    console.log(`Refill at: ${portfolio.refillTarget(refillPercent)}`)
    console.log(`Take profit at: ${portfolio.takeProfitTarget(takeProfitPercent)}`)
    console.log(``)
}