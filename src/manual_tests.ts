//TODO: replace with unit tests

import {describe} from "./util/utils";
import {TrackerState} from "./state/tracker_state";
import {globalTargetBalance} from "./util/vars";

const state = new TrackerState(globalTargetBalance);
const portfolio = state.get('123');
const refillPercent = 0.10;
const takeProfitPercent = 0.30;
const ds = () => describe(portfolio, refillPercent, takeProfitPercent);

ds()
portfolio.refill(Math.max(portfolio.invested, portfolio.targetValue) - portfolio.refillTarget(refillPercent));
ds()
portfolio.refill(Math.max(portfolio.invested, portfolio.targetValue) - portfolio.refillTarget(refillPercent));
ds()
portfolio.refill(Math.max(portfolio.invested, portfolio.targetValue) - portfolio.refillTarget(refillPercent));
ds()
portfolio.refill(Math.max(portfolio.invested, portfolio.targetValue) - portfolio.refillTarget(refillPercent));
ds()
portfolio.takeProfit(portfolio.takeProfitTarget(takeProfitPercent) - Math.max(portfolio.invested, portfolio.targetValue));
ds()

portfolio.refill(Math.max(portfolio.invested, portfolio.targetValue) - portfolio.refillTarget(refillPercent));
ds()

// portfolio.takeProfit(300)
// ds()
// portfolio.takeProfit(portfolio.takeProfitTarget(takeProfitPercent) - portfolio.targetValue)
// ds()
//
// portfolio.updateTarget(2000)
// portfolio.refill(portfolio.targetValue - portfolio.refillTarget(refillPercent));


