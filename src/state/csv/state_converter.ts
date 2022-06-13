import {PortfolioState, TrackerState} from "../tracker_state";

const actionSeparator = "\t";
const headerSeparator = ",";

function applyBalanceBook(actions: string[], func: (a: number) => void) {
    for (const action of actions) {
        if (!action || action.trim().length <= 0) {
            continue;
        }

        const actionValue = +(action.trim())
        func(actionValue);
    }
}

export function stateFromTsv(contents: string): TrackerState {
    /*
        [0]: AccountId
        [5]: Bot state [enabled/disabled]
        [8]: TP Level
        [10]: TP Target
        [13]: Refill Level
        [15]: Refill target
     */
    const state = new TrackerState()
    const lines = contents.replace("\\,", '').replace("\r", '').split("\n")

    function createPortfolio(accountId: string, tracked: boolean, actionLines: string[], investmentLines: string[], bankLines: string[]) {
        let portfolio = new PortfolioState(accountId, tracked)

        // TODO: We need to calculate everything due to a google docs bug: https://issuetracker.google.com/issues/218993622
        // const tpLevel = tracked ? extractNumber(actionLines[8]) : 0
        // const tpTarget = tracked ? extractNumber(actionLines[10]) : 0
        // const refillLevel = tracked ? extractNumber(actionLines[13]) : 0
        // const refillTarget = tracked ? extractNumber(actionLines[15]) : 0

        portfolio.tpPercent = extractNumber(investmentLines[8]) / 100.0
        portfolio.tpStrategy = investmentLines[10]
        portfolio.refillPercent = extractNumber(investmentLines[13]) / 100.0
        portfolio.refillStrategy = investmentLines[15]
        if (bankLines[20].trim()) {
            portfolio.adjustTpStats(extractNumber(bankLines[20]))
        }
        if (bankLines[21].trim()) {
            portfolio.adjustRefillStats(extractNumber(bankLines[21]))
        }

        applyBalanceBook(actionLines.slice(27), (a) => portfolio.tpRefill(a));
        applyBalanceBook(investmentLines.slice(27), (a) => portfolio.invest(a));
        applyBalanceBook(bankLines.slice(27), (a) => portfolio.deposit(a));

        return portfolio;
    }

    for (let i = 0; i < lines.length; i+=3) {

        try {


            const actionLines = lines[i].split(actionSeparator)

            const accountId = actionLines[0]
            if (!accountId.trim()) {
                continue
            }

            const tracked = actionLines[5].toLowerCase().startsWith('e')
            if (!tracked) {
                continue
            }



            const investmentLines = lines[i+1].split(actionSeparator)
            const bankLines = lines[i+2].split(actionSeparator)
            let portfolio = createPortfolio(accountId, tracked, actionLines, investmentLines, bankLines);

            state.put(accountId, portfolio)
        } catch (e) {
            state.addIncomplete(lines[i])
            console.log(`Failed to parse line: ${lines[i]}`, e)
        }
    }
    return state;
}

const regex = /[+-]?\d+(\.\d+)?/g;
function extractNumber(value: string): number {
    return value.match(regex)!.map(function(v) { return parseFloat(v); })[0];
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


    const line = []
    line.push('HELP/COMMENTS')
    var i = 0
    for (const portfolioId of portfolioIds) {
        line.push(portfolioId)
        line.push(`Subaccount ${Math.floor((i++ / 4) + 1)}`)
        line.push(symbolMap[portfolioId])
    }

    const header = []
    header.push(line.join(headerSeparator))
    return header
}
