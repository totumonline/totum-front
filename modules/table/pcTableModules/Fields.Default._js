var defaultField = {
    sortable: false, //'acs', 'desc'
    width: 50,
    icon: 'fa-font',
    editable: false,
    required: true,
    insertable: false,
    type: 'string',
    getPanelVal(val) {
        return val;
    },
    getEditVal: function (input) {
        var val = input.val().trim();
        var error = false,
            notify;
        if (this.required && (val === undefined || val === '' || val === null)) {
            notify = 'Поле ' + this.title + ' должно быть заполнено';
            error = true;
        }

        if (this.regexp && val !== '') {
            var r = new RegExp(this.regexp);
            if (!r.test(val)) {
                notify = this.regexpErrorText || 'regexp не проходит - "' + this.regexp + '"';
                notify = 'Ошибка заполнения поля "' + this.title + '": ' + notify;
                error = true;
            }
        }
        if (error) throw notify;
        return val;
    },

    getEditElement: function ($oldInput, oldValue, item, enterClbk, escClbk, blurClbk, tabindex) {
        var $input = $('<input type="text" class="form-control" name="cell_edit" autocomplete="off" autocorrect="off" />');
        if (typeof tabindex !== 'undefined') $input.attr('tabindex', tabindex);

        var field = this;
        oldValue = oldValue.v;
        $input.val(oldValue).on('keyup', function (event) {
            switch (event.keyCode) {
                case 13:
                    try {
                        $input.data('enterClicked', true);
                        enterClbk($(this), event);
                    } catch (err) {
                        $input.data('enterClicked', false);
                        App.popNotify(err, $input, 'default');
                        field.focusElement($input);
                    }
                    break;
                case 27:
                    escClbk($(this), event);
                    break;
            }
        });


        $input.on('blur', function (event) {
            blurClbk($input, event);
        });
        return $input.select();
    },
    checkEditRegExp: function (val) {
        if (!this.warningEditRegExp) return true;
        try {
            let matches = this.warningEditRegExp.match(/^\/(.*?)\/([a-z]*)$/);
            let regExp = new RegExp(matches[1], matches[2]);

            return regExp.test(val);
        } catch (e) {
            return true;
        }
    },
    getCellText: function (fieldValue) {
        if (this.url === true && fieldValue) {
            let target = this.openIn || 'window';
            switch (target) {
                case 'window':
                    target = '_self';
                    break;
                case 'newWindow':
                    target = '_blank';
                    break;
            }
            let a = $('<a class="uri" target="' + target + '">').attr('href', fieldValue).text(fieldValue);
            if (target === 'iframe') {
                a.attr('onclick', 'return App.aInIframe(this);');
            }
            return a;
        }
        return fieldValue;
    },
    getPanelText: function (fieldValue, td, item) {
        return this.getCellText(fieldValue, td, item);
    },
    getCopyText: function (fieldValue, item) {
        let res = this.getPanelText(fieldValue.v, null, item);

        if (typeof res === 'string') return res;

        const checkDiv = function (res) {
            if (res && res.each && {}.toString.call(res.each) === '[object Function]') {
                let result = '';
                res.each(function () {
                    if (result !== "") result += "; ";
                    result += $(this).text().replace(/\n/g, '; ');
                });
                return result;
            }
            return res;
        };

        if (res === null) return "";

        if (typeof res === 'object' && !(res instanceof jQuery)) {
            let text;
            let def = $.Deferred();
            res.done(function (data) {
                def.resolve(checkDiv(data))
            }).fail(function () {
                def.resolve('Не удалось загрузить данные')
            });

            return def;
        }


        return checkDiv(res);
    },
    focusElement: function (input) {
        input.focus();
    },
    isDataModified: function (editVal, itemVal) {
        editVal = editVal + '';
        itemVal = itemVal + '';

        editVal === 'null' ? editVal = '' : false;
        itemVal === 'null' ? itemVal = '' : false;
        itemVal === (this.errorText || 'ОШБК!') ? itemVal = '' : false;
        itemVal === 'undefined' ? itemVal = '' : false;

        return editVal !== itemVal;
    },
    getFilterDataByValue: function (valObj) {
        let filterVals = [];
        this.addDataToFilter(filterVals, valObj);
        return Object.keys(filterVals);
    },
    addDataToFilter: function (filterVals, valObj) {
        let hash;
        let val='Пустое'
        if (valObj.v === null || valObj.v === '') {
            hash = ''.hashCode();
        } else {
            hash = valObj.v.toString().hashCode();
            val= typeof valObj.v === "string" ? valObj.v.replace(/"/g, "&quot;") : (valObj.v + ' ')
        }
        filterVals[hash] = val;
    },
    checkIsFiltered: function (fieldVal, filters) {
        let vals={};
        this.addDataToFilter(vals, fieldVal);
        return filters.some(function (v) {
            return v in vals;
        });
    },
    getCellTextInPanel: function (fieldValue, td, item) {
        return this.getCellText(fieldValue, td, item);
    },
    getPanelColumnIndex: function (val) {

        if (val.f && val.f.hide && val.f.hide.panel) return 0;
        else if (['text', 'comments', 'file', 'listRow'].indexOf(this.type) !== -1) return 1.5;
        else if (this.multiple) return 1.5;
        else return 1;
    },
    getHighCelltext: function (v, td, item){
        return (this.getPanelText ? this.getPanelText(v, td, item) : this.getCellText(v, td, item));
    }


};