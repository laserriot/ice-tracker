import {TrackerState} from "../tracker_state";
import {describe} from "../../util/utils";

const actionSeparator = "\t";
const headerSeparator = ",";

export function stateFromCsv(contents: string, defaultTarget: number): TrackerState {
    /*
        [0]: AccountId
        [1]: Pair
        [2]: Target value
        [3]: Ignore
        [4]: Portfolio
        [5]: comments
        [6]: comments
        [7]: comments
        [8]: comments
        [9]: Total invested
     */
    const state = new TrackerState(defaultTarget)
    const lines = contents.replace("\\,", '').replace("\r", '').split("\n")
    for (const line of lines) {
        if (!line.trim()) {
            continue
        }
        const columns = line.split(actionSeparator)
        let isIgnored = columns[3].trim().length > 0;
        if (isIgnored) {
            continue;
        }

        const portfolio = state.get(columns[0])
        let targetBalance = columns[2].trim();
        if (targetBalance.length > 0 && +(targetBalance) > 0) {
            portfolio.updateTarget(+(targetBalance))
        }

        portfolio.resetInvestments(0);
        const actions = columns.slice(10)
        for (const action of actions) {
            if (!action || action.trim().length <= 0) {
                continue;
            }

            const trimmed = action.trim()

            if (trimmed == 'x') {
                portfolio.resetInvestments(0);
                continue;
            }

            const actionValue = +(trimmed)
            if (actionValue < 0) {
                portfolio.takeProfit(-actionValue);
            } else {
                portfolio.refill(actionValue)
            }
        }

        console.log(columns[1])
        describe(portfolio, 0.05, 0.05, 100)
    }
    return state;
}

function toSymbolMap(filteredPortfolios: Portfolio[]): { [portfolioId: string]: string } {
    const symbolMap: { [portfolioId: string]: string } = {}
    for (const portfolio of filteredPortfolios) {
        symbolMap[portfolio.id] = portfolio.symbols.join('-')
    }
    return symbolMap;
}

export function toCsvHeader(state: TrackerState, filteredPortfolios: Portfolio[]): string[] {
    const symbolMap = toSymbolMap(filteredPortfolios);
    const portfolioIds = filteredPortfolios.map(p => p.id)

    const header = []

    const accountLine = []
    accountLine.push('AccountId')
    for (const portfolioId of portfolioIds) {
        accountLine.push(portfolioId)
    }
    header.push(accountLine.join(headerSeparator))

    const symbolsLine = []
    symbolsLine.push('Symbols')
    for (const portfolioId of portfolioIds) {
        symbolsLine.push(symbolMap[portfolioId])
    }
    header.push(symbolsLine.join(headerSeparator))


    const targetValueLine = []
    targetValueLine.push('Target value')
    for (const portfolioId of portfolioIds) {
        targetValueLine.push(state.get(portfolioId).targetValue)
    }
    header.push(targetValueLine.join(headerSeparator))

    header.push("Ignore")

    var i = 0
    const portfolioLine = []
    portfolioLine.push("Portfolio")
    for (const portfolioId of portfolioIds) {
        portfolioLine.push(`${Math.floor((i++ / 4) + 1)}`)
    }
    header.push(portfolioLine.join(headerSeparator))

    return header
}
