import {StateManager} from "../state/state_manager";
import assert from "assert";
import {EncryptedFileRepository} from "../state/encrypted_file_repository";
import {actionPortfolioId, actionValue, encryptionKey, globalTargetBalance, statePath} from "../util/vars";

const repository = new EncryptedFileRepository(encryptionKey, statePath)
const sm = new StateManager(repository, globalTargetBalance)
const state = sm.loadState();

for (const portfolioId of state.keys()) {
    state.get(portfolioId).resetInvestments()
}

sm.saveState(state)
console.log(state)
