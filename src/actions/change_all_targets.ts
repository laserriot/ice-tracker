import {StateManager} from "../state/state_manager";
import assert from "assert";
import {EncryptedFileRepository} from "../state/encrypted_file_repository";
import {actionPortfolioId, actionValue, encryptionKey, globalTargetBalance, statePath} from "../util/vars";

const repository = new EncryptedFileRepository(encryptionKey, statePath)
const sm = new StateManager(repository, globalTargetBalance)
const state = sm.loadState();

assert(actionValue > 0, 'Refill value needs to be greater than 0 (do you want to take profit instead?)')

for (const portfolioId of state.keys()) {
    state.get(portfolioId).updateTarget(actionValue)
}

sm.saveState(state)

console.log(state)
