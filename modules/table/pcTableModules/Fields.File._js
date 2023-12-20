(function () {
    fieldTypes.file = {
        icon: 'fa-file-image-o',
        getCellText: function (fieldValue) {
            this.editable = false
            this.insertable = false
            return "PRO"
        },
        getCopyText: function (fieldValue, item) {
            fieldValue = fieldValue.v;
            if (!fieldValue || fieldValue === null || fieldValue.length == 0) return '';
            let field = this;
            let toCopy = '';
            fieldValue.forEach((file) => {
                if (toCopy !== '') toCopy += "\n";
                toCopy += file.name + ' ' + window.location.protocol + '//' + window.location.host + this.getFilePath(file.file) + ' ' + field.getSize(file.size);
            });
            return toCopy;
        }
        ,
        getPanelText: function (fieldValue) {
            let div = $('<div class="file-mini-panel">PRO</div>');
            return div.data('text', "PRO");
        }
        ,
        getCellTextInPanel: function (oldValue) {
            let div = $('<div class="panel-preview">PRO</div>');
            return div;
        }
        ,
        isDataModified: function (edited, fromItem) {
            return false;
        }
    }
})();