import {ShrimpyApi} from "../shrimpy/api";
import {sleep} from "../util/utils";
import fs from 'fs'
import {
    baseCurrency,
    encryptionKey,
    globalTargetBalance,
    ignoredIds,
    privateKey,
    publicKey,
    refillLevel,
    statePath,
    takeProfitLevel
} from "../util/vars";
import {StateManager} from "../state/state_manager";
import {EncryptedFileRepository} from "../state/encrypted_file_repository";

const api = new ShrimpyApi(publicKey, privateKey);
const stateManager = new StateManager(new EncryptedFileRepository(encryptionKey, statePath), globalTargetBalance);

function processPortfolio(accountId: string, portfolios: ShrimpyBalances): Portfolio {
    let sum = 0;
    for (const portfolio of portfolios.balances) {
        sum += portfolio.usdValue;
    }
    // symbol only includes coins with > 20% of portfolio value (allows for leftover btc, etc)
    let symbols = portfolios.balances
        .filter(a => a.usdValue > sum * 0.2)
        .map(a => a.symbol)
        .sort((a, b) => baseCurrency == b ? -1 : baseCurrency == a ? 1 : a.localeCompare(b))
    return {
        id: accountId,
        symbols: symbols,
        usdValue: sum
    };
}

async function loadPortfolios(accounts: ShrimpyAccount[]) {
    let portfolios: Portfolio[] = []
    for (const account of accounts) {
        try {
            await sleep(500); // helps with Shrimpy API request limits
            await api.getBalances(account.id)
                .then((balances) => {
                    let p = processPortfolio(account.id, balances)
                    portfolios.push(p)
                    process.stdout.write(".")
                }, err => {
                    console.error(err);
                })
        } catch (err) {
            console.log(err)
        }
    }
    return portfolios;
}


function findRequiredActions(filteredPortfolios: Portfolio[]) {
    let state = stateManager.loadState()
    const previousKeys = state.keys().sort()

    let actions: string[] = []
    for (const portfolio of filteredPortfolios.sort((a, b) => b.usdValue - a.usdValue)) {

        const portfolioState = state.get(portfolio.id)
        const symbol = portfolio.symbols.join('-')
        let takeProfitAt = portfolioState.takeProfitTarget(takeProfitLevel);
        let refillAt = portfolioState.refillTarget(refillLevel);
        let portfolioLine = `${symbol} [id:${portfolio.id}]. `
            + `Target: $${portfolioState.targetValue.toFixed(2)}, invested: $${portfolioState.invested.toFixed(2)}, `
            + `refill at: ${refillAt.toFixed(2)}, take profit at: $${takeProfitAt.toFixed(2)}, current: $${portfolio.usdValue.toFixed(2)}`;

        if (portfolio.usdValue < refillAt) {
            actions.push(`REFILL $${(Math.max(portfolioState.targetValue, portfolioState.invested) - portfolio.usdValue).toFixed(2)} - ${portfolioLine}`)
        } else if (portfolio.usdValue > takeProfitAt) {
            actions.push(`TAKE PROFIT $${(portfolio.usdValue - portfolioState.targetValue).toFixed(2)} - ${portfolioLine}`)
        } else {
            console.log(`NO ACTION: ${portfolioLine}`)
        }
    }
    if (JSON.stringify(previousKeys) != JSON.stringify(state.keys().sort())) {
        stateManager.saveState(state)
    }
    return actions;
}

function saveActionsToFile(actions: string[]) {
    console.log(`ACTIONS:`)
    const actionsFile = fs.openSync('actions.txt', 'w')
    for (const action of actions) {
        console.log(action)
        fs.appendFileSync(actionsFile, `${action}\n`)

    }
    const footer = Buffer.from(fs.readFileSync('footer.txt').toString(), 'base64');
    fs.appendFileSync(actionsFile, `\n\n${footer.toString('utf8')}\n`)
    fs.closeSync(actionsFile)
}

(async () => {
    api.getAccounts()
        .then(async accounts => {
            console.log(`Checking ${accounts.length} accounts`);
            let portfolios = await loadPortfolios(accounts);

            console.log("Finished")
            const filteredPortfolios = portfolios
                .filter(p => p.symbols.length > 1)
                .filter(p => !ignoredIds.includes(p.id.toString()))
            let actions = findRequiredActions(filteredPortfolios);

            if (actions.length <= 0) {
                return;
            }

            saveActionsToFile(actions);
        }, err => {
            console.error(err);
        })
})()


