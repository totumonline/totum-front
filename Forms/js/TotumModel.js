class TotumModel {

    constructor(path, sess_hash) {
        this.path = path;
        this.sess_hash = sess_hash;
        this.rows = {};
        this.header = {};
        this.footer = {};
    }

    setSessHash(sess_hash) {
        this.sess_hash = sess_hash;
    }

    async load(post, get, input) {
        return this.__connect('getTableData', {
            post: post,
            get: get,
            input: input,
        })
    }

    async saveField(name, value) {
        let modify = {};
        modify[name] = value;
        return this.__connect('edit', {'params': modify})
    }

    async __connect(method, data, extraData) {
        let response, text;
        try {
            response = await fetch(this.path, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(Object.assign({
                    method: method,
                    sess_hash: this.sess_hash,
                    data: data
                }, extraData || {}))
            });
            text = await response.text();
        } catch (e) {
            console.log('e:' + e);
            throw Error("Ошибка коннекта с сервером");
        }
        let json;

        try {
            json = JSON.parse(text);
        } catch (e) {
            console.error('Ответ не в формате json: ' + text);
            return null;
        }
        if (json.error) {
            if (this.setChangesToForm)
                this.setChangesToForm({
                    errorNotification: json.error
                })
            else console.error(json.error)
            return json;
        }
        return json;
    }

    saveInsert(insertRow) {
        return this.__connect('add', insertRow)
    }

    saveData(change, ids) {
        return this.__connect('edit', change, {ids: JSON.stringify(ids)})
    }

    refresh() {
        return this.__connect('refresh', {})
    }

    getEditSelect(item, fieldName, q, parentid, viewtype) {
        return this.__connect('getEditSelect', {
            item: item, field: fieldName, q: q, viewtype: viewtype,
            parentId: parentid
        })
    }

    click(item, fieldName) {
        return this.__connect('click', {
            item: item,
            fieldName: fieldName
        })
    }

    checkInsert(row) {
        return this.__connect('checkInsertRow', row)
    }

    delete(ids) {
        return this.__connect('delete', ids)
    }
}

export default TotumModel;