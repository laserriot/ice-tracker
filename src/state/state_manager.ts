import {TrackerState} from "./tracker_state";
import {EncryptedFileRepository} from "./encrypted_file_repository";

export class StateManager {
    private readonly _defaultValue: number;
    private readonly _repository: EncryptedFileRepository;

    constructor(repository: EncryptedFileRepository, defaultValue: number) {
        this._defaultValue = defaultValue;
        this._repository = repository;
    }

    public loadState(): TrackerState {
        return this._repository.load<TrackerState>((object:any) => this.restoreState(object))
    }

    public saveState(state: TrackerState) {
        console.log("Saving state")
        this._repository.saveState<TrackerState>(state)
    }

    private restoreState(raw: any) {
        let newState = new TrackerState(this._defaultValue);
        if (!raw) {
            return newState;
        }

        if (raw._defaultTarget != this._defaultValue) {
            console.log(`Default target changed! Run change target action first. ${raw._defaultTarget} -> ${this._defaultValue}`)
        }

        for(const key of Object.keys(raw._portfolios)) {
            Object.assign(newState.get(key), raw._portfolios[key]);
        }
        return newState;
    }
}