import {ShrimpyApi} from "./shrimpy/api";
import {getenv, sleep} from "./utils";
import fs from 'fs'

const publicKey = getenv('ICETRACKER_SHRIMPY_API_KEY', '')
const privateKey = getenv('ICETRACKER_SHRIMPY_API_SECRET', '');
const targetBalance = +(getenv('ICETRACKER_TARGET_BALANCE', '250'));
const refillLevel = +(getenv('ICETRACKER_REFILL_LEVEL', '8'))/100.0;
const takeProfitLevel = +(getenv('ICETRACKER_TAKEPROFIT_LEVEL', '30'))/100.0;
const ignoredIds = (getenv('ICETRACKER_IGNORED_ACCOUNTS', '')).split(",");
const ignoredSymbols = getenv('ICETRACKER_IGNORED_SYMBOLS', 'USDT,BTC').split(",");
const api = new ShrimpyApi(publicKey, privateKey);


function processPortfolio(accountId: string, portfolios: ShrimpyBalances): Portfolio {
    let sum = 0;
    for (const portfolio of portfolios.balances) {
        sum += portfolio.usdValue;
    }
    // symbol only includes coins with > 20% of portfolio value (allows for leftover btc, etc)
    let symbol = portfolios.balances.filter((a: any) => a.usdValue > sum * 0.2).map((a: any) => a.symbol).join('-')
    return {
        id: accountId,
        symbol: symbol,
        usdValue: sum
    };
}

(async () => {
    let promise = api.getAccounts();
    promise
        .then(async accounts => {
            console.log(`Checking ${accounts.length} accounts`);
            let portfolios: Portfolio[] = []
            for (const account of accounts) {
                try {
                    await sleep(50); // helps with Shrimpy API request limits
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

            console.log("Finished")
            const filteredPortfolios = portfolios
                .filter(p => !ignoredSymbols.includes(p.symbol))
                .filter(p => !ignoredIds.includes(p.id.toString()))
            let actions: string[] = []
            for (const portfolio of filteredPortfolios.sort((a, b) => b.usdValue - a.usdValue)) {
                let ratio = portfolio.usdValue / targetBalance - 1;
                let portfolioLine = `(id:${portfolio.id}) ${portfolio.symbol}: ${(ratio * 100).toFixed(2)}%`;

                if (ratio < -refillLevel) {
                    actions.push(`REFILL ${portfolioLine}`)
                }
                else if (ratio > takeProfitLevel) {
                    actions.push(`TAKE PROFIT ${portfolioLine}`)
                } else {
                    console.log(`NO ACTION: ${portfolioLine}`)
                }
            }

            if (actions.length <= 0) {
                return;
            }

            console.log(`ACTIONS:`)
            const actionsFile = fs.openSync('actions.txt', 'w')
            for (const action of actions) {
                console.log(action)
                fs.appendFileSync(actionsFile, `${action}\n`)
            }
            fs.closeSync(actionsFile)
        }, err => {
            console.error(err);
        })
})()


