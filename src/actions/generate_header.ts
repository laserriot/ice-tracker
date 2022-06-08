import {ShrimpyApi} from "../shrimpy/api";
import {globalTargetBalance, privateKey, publicKey} from "../util/vars";
import {TrackerState} from "../state/tracker_state";
import {toCsvHeader} from "../state/csv/state_converter";
import {loadPortfolios} from "../shrimpy/portfolio";
import fs from 'fs'

const api = new ShrimpyApi(publicKey, privateKey);

(async () => {
    api.getAccounts()
        .then(async accounts => {
            console.log(`Checking ${accounts.length} accounts`);
            let portfolios = await loadPortfolios(accounts);

            console.log("Finished")
            const filteredPortfolios = portfolios
                .filter(p => p.symbols.length > 1)

            const csvHeader = toCsvHeader(new TrackerState(globalTargetBalance), filteredPortfolios)

            saveHeaderToFile(csvHeader)
        })
})();

function saveHeaderToFile(lines: string[]) {
    const actionsFile = fs.openSync('header.txt', 'w')
    for (const action of lines) {
        console.log(action)
        fs.appendFileSync(actionsFile, `${action}\n`)

    }
    fs.closeSync(actionsFile)
}

