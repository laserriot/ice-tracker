import {getenv} from "./utils";

/* SETTINGS */
export const globalTargetBalance = +(getenv('ICETRACKER_TARGET_BALANCE', '250'));
export const encryptionKey = getenv('ICETRACKER_STATE_FILE_ENCRYPTION_KEY', '')
export const statePath = getenv('ICETRACKER_STATE_FILE', 'tracker.state')
export const refillLevel = +(getenv('ICETRACKER_REFILL_LEVEL', '7')) / 100.0;
export const takeProfitLevel = +(getenv('ICETRACKER_TAKEPROFIT_LEVEL', '7')) / 100.0;

/* REPORTING */
export const publicKey = getenv('ICETRACKER_SHRIMPY_API_KEY', '')
export const privateKey = getenv('ICETRACKER_SHRIMPY_API_SECRET', '');
export const ignoredIds = (getenv('ICETRACKER_IGNORED_ACCOUNTS', '')).split(",");
export const baseCurrency = getenv('ICETRACKER_BASE_CURRENCY', 'USDT');

/* ACTIONS */
export const actionPortfolioId = getenv("ICETRACKER_PORTFOLIO_ID", '')
export const actionValue = +getenv("ICETRACKER_ACTION_VALUE", '0')

