import {ShrimpyAuthenticationProvider} from "./authentication_provider";
import axios from 'axios';

const accountsPath = "/v1/accounts";
const shrimpyBaseUri = "https://api.shrimpy.io"

function pathInAccount(exchangeId: any, subpath: string) {
    return `${accountsPath}/${exchangeId}/${subpath}`
}

export class ShrimpyApi {
    private readonly _authenticationProvider: ShrimpyAuthenticationProvider;

    constructor(
        publicKey: string,
        privateKey: string,
    ) {
        this._authenticationProvider = new ShrimpyAuthenticationProvider(publicKey, privateKey)
    }


    private async get<T>(path: string): Promise<T> {
        const nonce = Date.now();
        const method = 'GET';
        const authString = path + method + nonce + "";
        const signature = this._authenticationProvider.createSignature(authString)
        const options = {
            headers: {
                'SHRIMPY-API-KEY': `${this._authenticationProvider.publicKey}`,
                'SHRIMPY-API-NONCE': `${nonce}`,
                'SHRIMPY-API-SIGNATURE': `${signature}`,
            }
        }

        const response = await axios.get(`${shrimpyBaseUri}${path}`, options);
        return response.data;
    }

    async getAccounts(): Promise<ShrimpyAccount[]> {
        return this.get<ShrimpyAccount[]>(accountsPath);
    }

    async getBalances(account: string): Promise<ShrimpyBalances> {
        return this.get<ShrimpyBalances>(pathInAccount(account, "balance"));
    }
}
