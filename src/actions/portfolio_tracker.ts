import {ShrimpyApi} from "../shrimpy/api";
import fs from 'fs'
import {emailHeader, privateKey, publicKey, tsvUrl} from "../util/vars";
import {TrackerState} from "../state/tracker_state";
import {stateFromTsv} from "../state/csv/state_converter";
import {loadPortfolios} from "../shrimpy/portfolio";
import {compareString} from "../util/utils";

const api = new ShrimpyApi(publicKey, privateKey);

function loadBalances(filteredPortfolios: Portfolio[], state: TrackerState): string[] {
    let actions: string[] = []
    for (const portfolio of filteredPortfolios.sort((a, b) => compareString(a.id, b.id))) {
        const portfolioState = state.get(portfolio.id)
        const symbol = portfolio.symbols.join('-')
        if (!portfolioState.tracked) {
            console.log(`Ignored account: ${portfolio.id} ${symbol}`)
            continue;
        }

        let refillLevel = portfolioState.refillLevel();
        let takeProfitLevel = portfolioState.tpLevel();
        let target = portfolioState.initialInvestment;
        let portfolioLine = `${symbol} [id:${portfolio.id}]. `
            + `Target: ${target.toFixed(2)}. Refill at: ${refillLevel.toFixed(2)}, `
            + `current: $${portfolio.usdValue.toFixed(2)}, take profit at: $${takeProfitLevel.toFixed(2)}`;

        if (portfolio.usdValue < refillLevel) {
            actions.push(`REFILL $${(target - portfolio.usdValue).toFixed(2)} to ${[target.toFixed(2)]} - ${portfolioLine}`)
        } else if (portfolio.usdValue > takeProfitLevel) {
            actions.push(`TAKE PROFIT $${(portfolio.usdValue - target).toFixed(2)} to ${[target.toFixed(2)]} - ${portfolioLine}`)
        } else {
            actions.push(`NO ACTION: ${portfolioLine}`)
        }
    }

    for (const incomplete of state.incomplete) {
        actions.push(`FAILED TO READ GOOGLE DOCS LINE. PLEASE FIX OR DISABLE: ${incomplete}`)
    }
    return actions;
}

function saveActionsToFile(actions: string[], path: string = 'actions.txt', header: string = '') {
    console.log(`${path}`)

    const actionsFile = fs.openSync(path, 'w')
    fs.appendFileSync(actionsFile, `https://dashboard.shrimpy.io\n${emailHeader}\n\n`);

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
            const state = stateFromTsv(body);

            api.getAccounts()
                .then(async accounts => {
                    console.log(`Checking ${accounts.length} accounts`);
                    let portfolios = await loadPortfolios(accounts);

                    console.log("Finished")
                    const filteredPortfolios = portfolios
                        .filter(p => p.symbols.length > 1)

                    let balances = loadBalances(filteredPortfolios, state);

                    saveActionsToFile(balances, "balances.txt")

                    let actions = balances.filter(s => !s.startsWith("NO ACTION"));
                    if (actions.length <= 0) {
                        return;
                    }

                    saveActionsToFile(actions.filter(s => !s.startsWith("NO ACTION")), "actions.txt");
                }, err => {
                    console.error(err);
                })
        }
    });
