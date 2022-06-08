import {baseCurrency, privateKey, publicKey} from "../util/vars";
import {sleep} from "../util/utils";
import {ShrimpyApi} from "./api";

const api = new ShrimpyApi(publicKey, privateKey);

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

export async function loadPortfolios(accounts: ShrimpyAccount[]) {
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
