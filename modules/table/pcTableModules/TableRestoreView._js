(function () {
    App.pcTableMain.prototype.switchRestoreView = function () {
        if (this.isRestoreView) {
            if (this.isTreeViewRestore) {
                App.windowReloadWithHash(this.model);
                return;
            }
        } else if (this.isTreeView) {
            this.isTreeViewRestore = true;
            this.dataSorted=[];
            this.dataSortedVisible=[];
            this.data={};
            this.isTreeView = false;
            this.treeApply = ()=>{}
        }

        this.isRestoreView = !this.isRestoreView;
        this._rowsButtons();
        this.model.refresh(undefined, undefined, true);
        this.model.setLoadedTableData(this.data);
    }
})();