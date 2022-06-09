const tolerance = 1;

export class TrackerState {

    private readonly _portfolios: { [portfolioId: string]: PortfolioState }
    private readonly _defaultTarget: number

    constructor(defaultTarget: number) {
        this._portfolios = {};
        this._defaultTarget = defaultTarget;
    }

    public keys(): string[] {
        return Object.keys(this._portfolios);
    }

    public get(portfolioId: string): PortfolioState {
        if (!this._portfolios[portfolioId]) {
            this._portfolios[portfolioId] = new PortfolioState(this._defaultTarget);
        }
        return this._portfolios[portfolioId];
    }
}

export class PortfolioState {

    private _targetValue: number;
    private _invested: number;
    private _tracked: boolean;

    constructor(targetValue: number, invested: number = targetValue, refillCount: number = 1, tracked: boolean = true) {
        this._invested = invested;
        this._tracked = tracked;
        this._targetValue = targetValue;
    }

    public updateTarget(newTarget: number): void {
        this._targetValue = newTarget;
    }

    public resetInvestments(newValue: number = this._targetValue): void {
        this._invested = newValue;
    }

    public refill(refill: number): void {
        console.log(`ACTION refill: ${refill}`)
        this._invested += refill;
    }

    public takeProfit(takeProfit: number): void {
        console.log(`ACTION takeProfit: ${takeProfit}`)
        this._invested = Math.max(this._invested - takeProfit, this._targetValue)
    }

    public refillTarget(refillLevel: number): number {
        return Math.max(this._invested, this._targetValue) * (1 - this.refillMultiplier(this._invested, this._targetValue, refillLevel) * refillLevel);
    }

    public takeProfitTarget(takeProfitLevel: number): number {
        return Math.max(this._invested, this._targetValue) * (1 + takeProfitLevel);
    }

    get invested(): number {
        return this._invested;
    }

    get targetValue(): number {
        return this._targetValue;
    }

    get tracked(): boolean {
        return this._tracked
    }

    set tracked(tracked: boolean) {
        this._tracked = tracked;
    }

    public refillMultiplier(invested: number, targetValue: number, refillPercent: number): number {
        let tempTarget = targetValue;
        let multiplier = 1;
        var refillStep = refillPercent*targetValue;
        while (tempTarget + tolerance - invested < -refillStep*0.33) {
            const tempRefillLevel = tempTarget * (1 - refillPercent*multiplier);
            refillStep = tempTarget - tempRefillLevel;
            tempTarget += refillStep;
            multiplier++;
        }
        return multiplier;
    }
}