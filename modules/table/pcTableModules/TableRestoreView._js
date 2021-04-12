(function () {
    App.pcTableMain.prototype.switchRestoreView = function () {
        this.isRestoreView = !this.isRestoreView;
        this._rowsButtons();
        this.model.refresh(undefined, undefined, true);
    }
})();