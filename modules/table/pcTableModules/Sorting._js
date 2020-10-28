$.extend(App.pcTableMain.prototype, {
    sort: function (field, sortDirection) {
        let pcTable = this;
        let fieldName = field.name;

        let isNumber = field.type === 'number';
        let data = pcTable.data;

        if (!(pcTable.nSorted = field.name === 'n')) {
            this._table.addClass('no-correct-n-filtered');
        }

        if (isNumber) {
            pcTable.dataSorted = pcTable.dataSorted.sort(function (a, b) {
                let a1 = data[a][fieldName].v;
                let b1 = data[b][fieldName].v;

                let _a1, _b1;
                let r = 0;

                if (a1===null) {
                    if (b1===null) r = 0;
                    else r = -sortDirection;
                } else if (b1===null) {
                    r = sortDirection;
                } else {

                    try {
                        _a1 = Big(a1);
                    } catch (e) {
                        _a1 = Big(0);
                    }
                    try {
                        _b1 = Big(b1);
                    } catch (e) {
                        _b1 = Big(0);
                    }


                    if (_a1.gt(_b1)) r = sortDirection;
                    else if (_a1.eq(_b1)) r = 0;
                    else r = -sortDirection;
                }
                return r;
            });
        } else if (field.type === 'select') {
            pcTable.dataSorted = pcTable.dataSorted.sort(function (a, b) {
                let a_, b_;

                const getVal = function (a) {
                    let a_;

                    if (data[a][fieldName].v_) {
                        if (field.multiple) {
                            a_ = '';
                            data[a][fieldName].v_.forEach(function (v_) {
                                a_ += v_[0];
                            })
                        } else {
                            a_ = data[a][fieldName].v_[0]
                        }
                    } else {
                        a_ = data[a][fieldName].v;

                    }
                    return a_;
                };

                a_ = getVal(a);
                b_ = getVal(b);

                if (a_ === b_) return 0;
                else if (a_ > b_) return sortDirection;
                else return -sortDirection;
            });
        } else {
            pcTable.dataSorted = pcTable.dataSorted.sort(function (a, b) {
                let a_, b_;
                a_ = data[a][fieldName].v + '';
                b_ = data[b][fieldName].v + '';
                if (a_ > b_) return sortDirection;
                else if (a_ == b_) return 0;
                else return -sortDirection;
            });
        }
        this.dataSortedVisible = [];
        pcTable.dataSorted.every(function (id) {
            if (pcTable.data[id].$visible) pcTable.dataSortedVisible.push(id);
            return true;
        });

        pcTable._refreshContentTable();
    }
});