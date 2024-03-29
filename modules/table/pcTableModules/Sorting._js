$.extend(App.pcTableMain.prototype, {
    sort: function (field, sortDirection) {
        let pcTable = this;
        let fieldName = field.name;

        let isNumber = field.type === 'number';
        let data = pcTable.data;

        if (!(pcTable.nSorted = field.name === 'n')) {
            this._table.addClass('no-correct-n-filtered');
        }

        let sortFunc;

        const checkSortTextAsValue = function (a, b, aVal, bVal) {
            let aFormat = data[a][fieldName].f || {};
            let bFormat = data[b][fieldName].f || {};

            if ((aFormat.textasvalue && "text" in aFormat) || (bFormat.textasvalue && "text" in bFormat)) {

                if (aFormat.textasvalue === 'true') {
                    aFormat.textasvalue = true;
                } else if (aFormat.textasvalue === 'false' || !aFormat.textasvalue) {
                    aFormat.textasvalue = false;
                }
                if (bFormat.textasvalue === 'true') {
                    bFormat.textasvalue = true;
                } else if (bFormat.textasvalue === 'false' || !bFormat.textasvalue) {
                    bFormat.textasvalue = false;
                }

                if (aFormat.textasvalue != bFormat.textasvalue) {
                    if (aFormat.textasvalue === false) {
                        return -sortDirection;
                    } else if (bFormat.textasvalue === false) {
                        return sortDirection;
                    } else if (aFormat.textasvalue === true) {
                        return -sortDirection;
                    } else if (bFormat.textasvalue === true) {
                        return sortDirection;
                    } else if (aFormat.textasvalue === "str") {
                        return sortDirection;
                    } else if (bFormat.textasvalue === "str") {
                        return -sortDirection;
                    }
                }


                if ((aFormat.textasvalue && "text" in aFormat)) {
                    aVal = aFormat.text;
                }
                if ((bFormat.textasvalue && "text" in bFormat)) {
                    bVal = bFormat.text;
                }
                if (aFormat.textasvalue === true) {
                    try {
                        let a = Big(aVal);
                        let b = Big(bVal);
                        if (a.gt(b)) return sortDirection;
                        else if (a.eq(b)) return 0;
                        return -sortDirection;
                    } catch (e) {
                    }
                } else if (aFormat.textasvalue === "str") {
                    aVal = '!' + aVal;
                    bVal = '!' + bVal;
                }

                if (typeof aFormat.textasvalue === "string" && aFormat.textasvalue.substr(0, 3) === "num" && typeof bFormat.textasvalue === "string" && bFormat.textasvalue.substr(0, 3) === "num") {
                    let d1=(aFormat.textasvalue.split('|')[1] || field.dectimalSeparator);
                    let d2=(bFormat.textasvalue.split('|')[1] || field.dectimalSeparator);

                    let reg = new RegExp('[^0-9\\' + d1+ ']', 'g')
                    aVal = aVal.toString().replace(reg, '');
                    aVal = aVal.toString().replace(d1, '.');
                    let reg2 = new RegExp('[^0-9\\' + d2 + ']', 'g')
                    bVal = bVal.toString().replace(reg2, '');
                    bVal = bVal.toString().replace(d2, '.');

                    try {
                        let a = Big(aVal);
                        let b = Big(bVal);
                        if (a.gt(b)) return sortDirection;
                        else if (a.eq(b)) return 0;
                        return -sortDirection;
                    } catch (e) {
                    }
                }


                if (aVal > bVal) return sortDirection;
                else if (aVal == bVal) return 0;
                else return -sortDirection;
            }
            return false;
        }


        if (isNumber) {
            sortFunc = function (a, b) {
                let a1 = data[a][fieldName].v;
                let b1 = data[b][fieldName].v;

                let check = checkSortTextAsValue(a, b, a1, b1);
                if (check !== false) {
                    return check
                }

                let _a1, _b1;
                let r = 0;

                if (a1 === null) {
                    if (b1 === null) r = 0;
                    else r = -sortDirection;
                } else if (b1 === null) {
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
            };
        } else if (field.type === 'select') {
            sortFunc = function (a, b) {
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
                    if (a_ === null) a_ = '';
                    return a_;
                };

                a_ = getVal(a);
                b_ = getVal(b);

                let check = checkSortTextAsValue(a, b, a_, b_);
                if (check !== false) {
                    return check
                }

                if (a_ === b_) return 0;
                else if (a_ > b_) return sortDirection;
                else return -sortDirection;
            }
        } else {
            sortFunc = function (a, b) {
                let a_, b_;
                a_ = data[a][fieldName].v + '';
                b_ = data[b][fieldName].v + '';

                let check = checkSortTextAsValue(a, b, a_, b_);
                if (check !== false) {
                    return check
                }

                if (a_ > b_) return sortDirection;
                else if (a_ == b_) return 0;
                else return -sortDirection;
            };
        }

        if (pcTable.isTreeView) {

            if (fieldName !== 'tree' && pcTable.fields.tree.treeViewType !== 'self') {
                let list = [];
                let old = [...pcTable.dataSorted]
                pcTable.dataSorted = [];
                const sortList = () => {
                    if (list.length) {
                        list = list.sort(sortFunc)
                        pcTable.dataSorted.push(...list)
                        list = [];
                    }
                }

                old.forEach((v) => {
                    if (typeof v === 'object') {
                        sortList();
                        pcTable.dataSorted.push(v)
                    } else {
                        list.push(v)
                    }
                })
                sortList();
            } else {
                let sortTreeFunc = (a, b) => {
                    let a_ = pcTable.treeIndex[a].t || "";
                    let b_ = pcTable.treeIndex[b].t || "";

                    if (a_ === b_) return 0;
                    else if (a_ > b_) return sortDirection;
                    else return -sortDirection;
                };
                if (fieldName !== 'tree') {
                    sortTreeFunc = (a, b) => {
                        return sortFunc(pcTable.treeIndex[a].row.id, pcTable.treeIndex[b].row.id)
                    }
                }

                const sortTree = (id) => {
                    let branch = pcTable.treeIndex[id];
                    branch.trees = branch.trees.sort(sortTreeFunc)
                    branch.trees.forEach(sortTree);
                }
                pcTable.treeSort = pcTable.treeSort.sort(sortTreeFunc)
                pcTable.treeSort.forEach(sortTree)
                pcTable.treeApply();
            }

        } else {
            pcTable.dataSorted = pcTable.dataSorted.sort(sortFunc)
        }

        pcTable.dataSortedVisible = []
        for (let i = 0; i < this.dataSorted.length; i++) {
            let element = this.dataSorted[i];
            if (typeof element === 'object') {
                pcTable.dataSortedVisible.push(element);
            } else {
                let item = this.data[element];
                this.__applyFiltersToItem(item);
                if (item.$visible) {
                    pcTable.dataSortedVisible.push(element);
                }
            }
        }

        pcTable._refreshContentTable();
    }
});