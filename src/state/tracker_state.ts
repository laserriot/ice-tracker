const tolerance = 1;

export class TrackerState {
    private readonly _portfolios: { [portfolioId: string]: PortfolioState }

    private _incomplete: string[];

    constructor() {
        this._portfolios = {};
        this._incomplete = [];
    }

    public keys(): string[] {
        return Object.keys(this._portfolios);
    }

    public get(portfolioId: string): PortfolioState {
        if (!this._portfolios[portfolioId]) {
            this._portfolios[portfolioId] = new PortfolioState();
        }
        return this._portfolios[portfolioId];
    }

    public put(portfolioId: string, state: PortfolioState) {
        this._portfolios[portfolioId] = state;
    }

    public addIncomplete(incomplete: string) {
        return this._incomplete;
    }

    get incomplete(): string[] {
        return this._incomplete;
    }
}

export class PortfolioState {

    private _accountId: string;
    private _tracked: boolean;

    private _initialInvestment: number;
    private _investedValue: number;
    private _bankBalance: number;
    private _refillStats: number;
    private _refillCounter: number;
    private _tpStats: number;
    private _tpCounter: number;

    private _tpPercent: number;
    private _tpStrategy: string;

    private _refillPercent: number;
    private _refillStrategy: string;


    constructor(accountId: string = '', tracked: boolean = false) {
        this._accountId = accountId;
        this._tracked = tracked;

        this._initialInvestment = 0;
        this._investedValue = 0;
        this._bankBalance = 0;
        this._refillStats = 0;
        this._tpStats = 0;
        this._refillCounter = 0;
        this._tpCounter = 0;

        this._tpPercent = 0.3;
        this._tpStrategy = 'count'
        this._refillPercent = 0.1;
        this._refillStrategy = '1'
    }


    get initialInvestment(): number {
        return this._initialInvestment;
    }

    get investedValue(): number {
        return this._investedValue;
    }

    get bankBalance(): number {
        return this._bankBalance;
    }

    get tpPercent(): number {
        return this._tpPercent;
    }

    set tpPercent(value: number) {
        this._tpPercent = value;
    }

    get tpStrategy(): string {
        return this._tpStrategy;
    }

    set tpStrategy(value: string) {
        this._tpStrategy = value;
    }

    get refillPercent(): number {
        return this._refillPercent;
    }

    set refillPercent(value: number) {
        this._refillPercent = value;
    }

    get refillStrategy(): string {
        return this._refillStrategy;
    }

    set refillStrategy(value: string) {
        this._refillStrategy = value;
    }

    get accountId(): string {
        return this._accountId;
    }

    set accountId(value: string) {
        this._accountId = value;
    }

    get tracked(): boolean {
        return this._tracked;
    }

    set tracked(value: boolean) {
        this._tracked = value;
    }

    public adjustRefillStats(value: number) {
        this._refillStats += value;
    }

    public adjustTpStats(value: number) {
        this._tpStats += value;
    }

    public tpRefill(value: number) {
        if (value > 0) {
            this._tpCounter = 0;
            this._refillCounter++;
            this._refillStats += value;
            this._initialInvestment += value;
        } else if (value < 0) {
            this._tpCounter++;
            this._refillCounter = 0;
            this._tpStats -= value;
        } else if (value == 0) {
            this._tpCounter = 0;
            this._refillCounter = 0;
        }
        this._bankBalance -= value;
    }

    public invest(value: number) {
        this._investedValue += value;
        this._initialInvestment += value;
        this._bankBalance -= value;
        this._tpStats += value;
        this._refillStats += value;
    }

    public deposit(value: number) {
        this._bankBalance += value;
    }

    public tpLevel(): number {
        return this._initialInvestment * (1 + this._tpPercent * this.tpMultiplier())
    }

    public refillLevel(): number {
        return this._initialInvestment * (1 - this._refillPercent * this.refillMultiplier())
    }

    private tpMultiplier(): number {
        return this.portfolioMultiplier(this._tpStrategy, this._tpCounter, this._tpStats, this._refillStats, this._tpPercent)
    }

    private refillMultiplier(): number {
        return this.portfolioMultiplier(this._refillStrategy, this._refillCounter, this._refillStats, this._tpStats, this._refillPercent)
    }

    private portfolioMultiplier(strategy: string, count: number, balance: number, invested: number, percent: number): number {
        if (+strategy > 0) {
            return +strategy
        }

        const strategyName = strategy.toString().toLowerCase().replace(' ', '');
        if (strategyName.startsWith('count')) {
            return 1 + count;
        }
        if (strategyName.startsWith('auto') || strategyName.startsWith('value')) {
            return this.martingaleValuesToMultiplier(balance, invested, percent);
        }
        return 1
    }

    private martingaleValuesToMultiplier(balance: number, invested: number, percent: number): number {
        //TODO formula in progress
        var tempTarget = invested;
        var multiplier = 1;
        var refillStep = percent * invested;
        while (tempTarget + tolerance - balance < -refillStep * 0.33) {
            const tempRefillLevel = tempTarget * (1 - percent * multiplier);
            refillStep = tempTarget - tempRefillLevel;
            tempTarget += refillStep;
            multiplier++;
        }
        return multiplier;
    }
}