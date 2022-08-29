(function () {
    App.commonFiltersExtenders = function (q) {
        let isLikedFunc = () => {
            return true;
        };

        if (q && q !== '') {
            let [qs] = App.lang.search_prepare_function(q);
            let controlMatches = qs.match(/^([!\^~= ]+):\s*/);
            let qA = qs.split(" ");

            const prepareV = (v) => {
                let text;
                if (v === null) {
                    text = "";
                } else {
                    text = v.toString();
                    [text] = App.lang.search_prepare_function(text);
                }
                return text;
            }

            isLikedFunc = function (v) {
                let text = prepareV(v);
                return qA.every(function (q) {
                    return text.indexOf(q) !== -1
                })
            }

            if (controlMatches) {
                qs = qs.substring(controlMatches[0].length).trim();
                [qs] = App.lang.search_prepare_function(qs);
                qA = qs.split(" ")

                if (qs === '') {
                    isLikedFunc = () => {
                        return true;
                    };
                } else {

                    switch (controlMatches[1]) {
                        case '!=':
                            isLikedFunc = (v) => {
                                let text = prepareV(v);
                                return qs !== text;
                            }
                            break;
                        case '=':
                            isLikedFunc = (v) => {
                                let text = prepareV(v);
                                return qs === text;
                            }
                            break;
                        case '~':
                            isLikedFunc = (v) => {
                                let text = prepareV(v);
                                return text.indexOf(qs) !== -1
                            }
                            break;
                        case '!~':
                            isLikedFunc = (v) => {
                                let text = prepareV(v);
                                return text.indexOf(qs) === -1
                            }
                            break;
                        case '!~~':
                        case '!':
                            isLikedFunc = (v) => {
                                let text = prepareV(v);
                                return qA.every(function (q) {
                                    return text.indexOf(q) === -1
                                })
                            }
                            break;

                        case '^':
                            isLikedFunc = (v) => {
                                let text = prepareV(v);
                                text = text.split(" ");
                                return qA.every(function (q) {
                                    return text.some(function (w) {
                                        return w.indexOf(q) === 0
                                    });
                                })
                            }
                            break;
                        case '!^':
                            isLikedFunc = (v) => {
                                let text = prepareV(v);
                                text = text.split(" ");
                                return qA.every(function (q) {
                                    return !text.some(function (w) {
                                        return w.indexOf(q) === 0
                                    });
                                })
                            }
                            break;
                        case '^~':
                            isLikedFunc = (v) => {
                                let text = prepareV(v);
                                return text.indexOf(qs) === 0;
                            }
                            break;
                        case '!^~':
                            isLikedFunc = (v) => {
                                let text = prepareV(v);
                                return text.indexOf(qs) !== 0;
                            }
                            break;
                    }
                }

            }
        }
        return isLikedFunc
    };

})();
