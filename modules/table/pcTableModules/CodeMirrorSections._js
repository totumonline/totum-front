(function () {
    CodeMirror.defineMode("sections", function () {
        return {
            startState: function () {
                return {};
            },
            token: function (stream, state) {

                if (stream.lineOracle.line===0) {
                    stream.skipToEnd();
                    state.isStart = false;
                    return 'sec-title';
                }

                if (stream.pos === 0) {
                    stream.skipTo(':');
                    stream.next();

                    state.isParamsPart = true;

                    return 'sec-param';
                } else {
                    let lastString=stream.string.substring(stream.pos);

                    if (state.isParamsPart && lastString.match(':')) {
                        let val = 'sec-parts';
                        let nextZPT = lastString.indexOf(',');
                        let sign = ':';
                        if (nextZPT !== -1) {
                            sign = ','
                        } else {
                            state.isParamsPart = false;
                        }
                        if (/^\s*\d+\s*$/.test(lastString.substring(0, lastString.indexOf(sign)))) {
                            val = 'sec-num-parts';
                        }
                        stream.skipTo(sign);
                        stream.next();
                        return val;
                    } else {
                        if (/^\s*(true|false)\s*$/.test(lastString)) {
                            stream.skipToEnd();
                            return 'boolean'
                        } else {
                            stream.skipToEnd();
                            return 'sec-value'
                        }
                    }
                }
            }
        };
    });
    CodeMirror.sectionsAutoCloses = function (cm) {
        cm.on("keyup", function (cm, event) {
            var popupKeyCodes = {
                "9": "tab",
                "13": "enter",
                "27": "escape",
                "33": "pageup",
                "34": "pagedown",
                "35": "end",
                "36": "home",
                "38": "up",
                "40": "down",
                "57": "("
            };

            //ctrl-s
            let isBigOneSave = cm.options.bigOneDialog && window.top.wasCtrl(event) && (event.keyCode || event.which).toString() === '83';


            if (isBigOneSave) {
                event.stopPropagation();
                if(typeof cm.options.bigOneDialog=== 'function'){
                    cm.options.bigOneDialog();
                }else {
                    cm.options.bigOneDialog.close()
                }

            } else if (window.top.wasCtrl(event) && (event.keyCode || event.which).toString() === '191') {
                CodeMirror.commentMe(cm);
            }

            if ((event.keyCode || event.which).toString() === '27') {
                if (cm.state.completionActive) {
                    cm.state.completionActive.close();
                }
                event.stopPropagation();

            } else if (!popupKeyCodes[(event.keyCode || event.which).toString()]) {
                CodeMirror.showHint(cm, CodeMirror.hint.totumVars, {});
            }

        });

    }

})();