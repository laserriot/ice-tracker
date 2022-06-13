import {getenv} from "./utils";

/* SETTINGS */
export const tsvUrl = getenv('ICETRACKER_TSV_URL', '')
export const emailHeader = getenv('ICETRACKER_HEADER', '')

/* REPORTING */
export const publicKey = getenv('ICETRACKER_SHRIMPY_API_KEY', '')
export const privateKey = getenv('ICETRACKER_SHRIMPY_API_SECRET', '');
export const baseCurrency = getenv('ICETRACKER_BASE_CURRENCY', 'USDT');

