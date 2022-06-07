//TODO: replace with unit tests

import {StateManager} from "./state/state_manager";
import {EncryptedFileRepository} from "./state/encrypted_file_repository";
import {actionValue, encryptionKey, statePath} from "./util/vars";
import {describe} from "./util/utils";

const sm = new StateManager(new EncryptedFileRepository(encryptionKey, statePath), 1000)

const state = sm.loadState();
const portfolio = state.get('123');
const refillPercent = 0.05;
const takeProfitPercent = 0.05;
const ds = () => describe(portfolio, refillPercent, takeProfitPercent);

ds()
portfolio.refill(portfolio.invested - portfolio.refillTarget(refillPercent));
ds()
portfolio.refill(portfolio.invested - portfolio.refillTarget(refillPercent));
ds()
portfolio.refill(portfolio.invested - portfolio.refillTarget(refillPercent));
ds()
portfolio.refill(portfolio.invested - portfolio.refillTarget(refillPercent));
ds()
portfolio.takeProfit(300)
ds()
portfolio.takeProfit(portfolio.takeProfitTarget(takeProfitPercent) - portfolio.targetValue)
ds()

portfolio.updateTarget(2000)
portfolio.refill(portfolio.invested - portfolio.refillTarget(refillPercent));


ds()

sm.saveState(state)

