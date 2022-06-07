import {StateManager} from "../state/state_manager";
import assert from "assert";
import {EncryptedFileRepository} from "../state/encrypted_file_repository";
import {actionPortfolioId, actionValue, encryptionKey, globalTargetBalance, statePath} from "../util/vars";

const repository = new EncryptedFileRepository(encryptionKey, statePath)
const sm = new StateManager(repository, globalTargetBalance)
const state = sm.loadState();

assert(actionPortfolioId, 'Unknown portfolio id')

state.get(actionPortfolioId).resetInvestments()

sm.saveState(state)

console.log(state)
