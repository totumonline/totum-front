(function () {
    App.pcTableMain.prototype.switchRestoreView = function () {
        if (this.isRestoreView) {
            App.windowReloadWithHash(this.model);
            return;
        }

        this.isRestoreView = !this.isRestoreView;
        this._rowsButtons();
        this.model.refresh(undefined, undefined, true);
        this.model.setLoadedTableData(this.data);
    }
})();