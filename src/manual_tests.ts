//TODO: replace with unit tests

import {describe} from "./util/utils";
import {PortfolioState, TrackerState} from "./state/tracker_state";
import {globalTargetBalance} from "./util/vars";

const state = new TrackerState(globalTargetBalance);
const portfolio = new PortfolioState(100)
const refillPercent = 0.05;
const takeProfitPercent = 0.05;
const ds = () => describe(portfolio, refillPercent, takeProfitPercent);

ds()
portfolio.refill(portfolio.targetValue - portfolio.refillTarget(refillPercent));
ds()
portfolio.refill(portfolio.targetValue - portfolio.refillTarget(refillPercent));
ds()
portfolio.refill(portfolio.targetValue - portfolio.refillTarget(refillPercent));
ds()
portfolio.refill(portfolio.targetValue - portfolio.refillTarget(refillPercent));
ds()
portfolio.refill(portfolio.targetValue - portfolio.refillTarget(refillPercent));
ds()
portfolio.refill(portfolio.targetValue - portfolio.refillTarget(refillPercent));
ds()
portfolio.refill(portfolio.targetValue - portfolio.refillTarget(refillPercent));
ds()
portfolio.refill(portfolio.targetValue - portfolio.refillTarget(refillPercent));
ds()
// portfolio.takeProfit(300)
// ds()
// portfolio.takeProfit(portfolio.takeProfitTarget(takeProfitPercent) - portfolio.targetValue)
// ds()
//
// portfolio.updateTarget(2000)
// portfolio.refill(portfolio.targetValue - portfolio.refillTarget(refillPercent));


