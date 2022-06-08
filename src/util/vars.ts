import {getenv} from "./utils";

/* SETTINGS */
export const globalTargetBalance = +(getenv('ICETRACKER_TARGET_BALANCE', '250'));
export const csvUrl = getenv('ICETRACKER_CSV_URL', '')
export const refillLevel = +(getenv('ICETRACKER_REFILL_LEVEL', '7')) / 100.0;
export const takeProfitLevel = +(getenv('ICETRACKER_TAKEPROFIT_LEVEL', '7')) / 100.0;

/* REPORTING */
export const publicKey = getenv('ICETRACKER_SHRIMPY_API_KEY', '')
export const privateKey = getenv('ICETRACKER_SHRIMPY_API_SECRET', '');
export const baseCurrency = getenv('ICETRACKER_BASE_CURRENCY', 'USDT');

