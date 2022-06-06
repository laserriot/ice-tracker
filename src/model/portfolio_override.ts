export interface PortfolioOverride {
    id: string,
    usdValue: number
}

export function toPortfolioOverride(p: string): PortfolioOverride {
    const entry = p.split(':');
    return {id: entry[0], usdValue: +(entry[1])};
}

