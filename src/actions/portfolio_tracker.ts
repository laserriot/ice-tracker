import {ShrimpyApi} from "../shrimpy/api";
import fs from 'fs'
import {tsvUrl, globalTargetBalance, privateKey, publicKey, refillLevel, takeProfitLevel} from "../util/vars";
import {TrackerState} from "../state/tracker_state";
import {stateFromTsv} from "../state/csv/state_converter";
import {loadPortfolios} from "../shrimpy/portfolio";

const api = new ShrimpyApi(publicKey, privateKey);

function findRequiredActions(filteredPortfolios: Portfolio[], state: TrackerState) {
    let actions: string[] = []
    for (const portfolio of filteredPortfolios.sort((a, b) => b.usdValue - a.usdValue)) {
        const portfolioState = state.get(portfolio.id)
        const symbol = portfolio.symbols.join('-')
        if (!portfolioState.tracked) {
            console.log(`Ignored account: ${portfolio.id} ${symbol}`)
            continue;
        }

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

const request = require('request');
request.get(tsvUrl,
    async function (error: any, response: any, body: any) {
        if (error) {
            console.error('Failed to load CSV/Google Sheet')
            console.error(error)
            process.exit(1)
        }
        if (response.statusCode == 200) {
            const state = stateFromTsv(body, globalTargetBalance);

            api.getAccounts()
                .then(async accounts => {
                    console.log(`Checking ${accounts.length} accounts`);
                    let portfolios = await loadPortfolios(accounts);

                    console.log("Finished")
                    const filteredPortfolios = portfolios
                        .filter(p => p.symbols.length > 1)

                    let actions = findRequiredActions(filteredPortfolios, state);

                    if (actions.length <= 0) {
                        return;
                    }

                    saveActionsToFile(actions);
                }, err => {
                    console.error(err);
                })
        }
    });
