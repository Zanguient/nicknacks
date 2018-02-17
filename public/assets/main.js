const Prompt = {
    it(errorObject) {
        this._filter(errorObject)
    },
    _alertFunction(errorObject) { alert(errorObject); },
    _filter(errorObject) {
        this._alertFunction(errorObject);
    }
}
