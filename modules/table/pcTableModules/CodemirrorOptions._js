(function () {

    let funcsFromTable = App.functions || [];

    let ActiveFuncNames = [];
    funcsFromTable.forEach(function (row) {
        if (!row.d) ActiveFuncNames.push(row.name);
    });

    let TOTUMjsFuncs = {};
    funcsFromTable.forEach(function (row) {
        TOTUMjsFuncs[row.name.toLowerCase()] = [row.t, 0, row.p, row.n, row.m, row.name];
    });
    let DbFieldParams = ['where', 'order', 'field', 'sfield', 'bfield', 'tfield', 'preview', 'parent', 'section', 'table', 'filter', 'fieldtitle', 'fieldhide'];

    CodeMirror.defaults.scrollbarStyle = 'overlay';

    CodeMirror.defineInitHook(function (mirror) {
        try {
            if (!mirror.options.bigOneDialog && screen.width > window.MOBILE_MAX_WIDTH) {
                let $resizer = $('<i class="fa fa-expand codemirror-expander" style="position: absolute;\n' +
                    '    right: 10px;\n' +
                    '    bottom: 10px;\n' +
                    '    z-index: 10000;\n' +
                    '    font-family: FontAwesome; cursor: pointer"></i>');

                $(mirror.display.wrapper).append($resizer);
                let newCodemirrorDiv;
                $resizer.on('click', function () {
                    newCodemirrorDiv = $('<div class="HTMLEditor" id="bigOneCodemirror" style="height: 100%;"></div>');

                    let value = mirror.getValue();
                    let editorMax;

                    window.top.BootstrapDialog.show({
                        message: newCodemirrorDiv,
                        type: null,
                        title: 'Правка текстового поля',

                        cssClass: 'fieldparams-edit-panel',
                        draggable: true,
                        onhide: function (event) {
                            mirror.setValue(editorMax.getValue());
                        },

                        onshow: function (dialog) {
                            dialog.$modalHeader.css('cursor', 'pointer');
                            dialog.$modalContent.css({
                                width: "90vw",
                                minHeight: "90vh"
                            });
                            dialog.$modalHeader.find('button.close').css('font-size', '16px').html('<i class="fa fa-compress"></i>')


                        },
                        onshown: function (dialog) {
                            editorMax = CodeMirror(newCodemirrorDiv.get(0), {
                                mode: mirror.options.mode,
                                value: value,
                                theme: 'eclipse',
                                lineNumbers: true,
                                indentWithTabs: true,
                                autoCloseTags: true,
                                bigOneDialog: dialog
                            });

                            if (mirror.table) editorMax.table = mirror.table;

                            let minheight = Math.round(dialog.$modalContent.height() - dialog.$modalHeader.outerHeight() - 40);
                            editorMax.getScrollerElement().style.minHeight = minheight + 'px';
                            newCodemirrorDiv.find('.CodeMirror').css('min-heught', minheight);
                            editorMax.focus();
                            dialog.$modalContent.position({
                                my: 'center top',
                                at: 'center top+30px',
                                of: window.top
                            });
                        }

                    });

                })
            }
        } catch (e) {
            mirror.setValue(e.message);
        }
    });

    const funcHelp = async function (name, span) {
        let nameL = name.toLowerCase();

        let div = $('<div style="width:200px" class="function-help">');
        $('<div class="func-template">').text(name + TOTUMjsFuncs[nameL][0]).appendTo(div).on('click', ()=>{
            return false;
        });
        let params=$('<div class="func-params">').appendTo(div).on('click', ()=>{
            return false;
        });

        TOTUMjsFuncs[nameL][2].forEach((f) => {
            let s=$('<span>').text(f);
            if(TOTUMjsFuncs[nameL][3].indexOf(f)!==-1){
                s.addClass('req');
            }
            if(TOTUMjsFuncs[nameL][4].indexOf(f)!==-1){
                s.addClass('multi');
            }
            if(DbFieldParams.indexOf(f)!==-1){
                s.addClass('db');
            }

            params.append(s)
            params.append(' ')

        })

        let btn=$('<a>').attr('href', 'https://docs.totum.online/functions#fn-'+TOTUMjsFuncs[nameL][5]).attr('target', '_blank').html('<button class="btn btn-default btn-sm">Документация</button>')
        div.append(btn.wrap('<div class="button">').parent())

        App.popNotify({
            isParams: true,
            $text: div,
            element: span,
            trigger: 'manual',

            container: $("body")
        });
        setTimeout(() => {
            $('#table').data('pctable').closeCallbacks.push(function () {
                if (span && span.length) span.popover('destroy');
            })
        }, 200);
        $('body').click();
    }


    CodeMirror.defineInitHook(function (mirror) {
        try {
            $(mirror.display.wrapper).on('contextmenu', '.cm-function', function () {
                let func = $(this).text();
                func = func.substring(0, func.length - 1)
                funcHelp(func, $(this));

                return false;
            })
        } catch (e) {
            console.log(e.message)
        }
    });


    const TotumTab = function (cm, alt, shift) {
        var cur = cm.getCursor(), token = cm.getTokenAt(cur);
        if (token.state.inFunction) {
            let start, stop;
            let line = cm.getLine(cur.line);

            if (shift || alt) {

                start = cur.ch;


                let check = start;
                while (line[check] === ' ') {
                    check++;
                }
                /*Удаляем следующий параметр*/
                if (line[check] === ';') {
                    start = check;
                    stop = start + 1;
                    while (line[stop] !== ';' && line[stop] !== ')') {
                        stop++;
                    }
                }
                /*Удаляем текущий параметр*/
                else {
                    stop = start;
                    while (line[stop] !== ';' && line[stop] !== ')') {
                        stop++;
                    }
                    if (line[stop] === ';') {
                        stop++
                    }

                    while (line[start] !== '(' && line[start] !== ';') {
                        start--;
                    }
                    start++;
                }

            } else {

                start = cur.ch;
                while (line[start] && [':', ')'].indexOf(line[start]) === -1) {
                    start++;
                }
                if (line[start] === ':') {
                    start++;
                    if (line[start] === ' ') start++;
                }


                if (line[start] === ' ') start++;
                stop = start;
                while (line[stop] && [';', ')'].indexOf(line[stop]) === -1) {
                    stop++;
                }
            }

            cm.setSelection({line: cur.line, ch: start}, {line: cur.line, ch: stop});
            //cm.setCursor({line: cur.line, ch: cur.ch+5});
            return true;
        }
    };

    CodeMirror.defineMode("totum", function () {
        return {
            startState: function () {
                return {inString: false, isStart: true, inFunction: false, lineName: ''};
            },
            token: function (stream, state) {


                function streamString() {
                    return stream.string.substring(stream.start, stream.pos);
                }

                function error() {
                    "use strict";
                    state.inFunction = false;
                    stream.skipToEnd();
                    return 'error';
                }

                function subFunc() {
                    let doubleS = false;
                    while (stream.peek() === '[' && stream.next()) {
                        if (stream.peek() === '[') {
                            doubleS = true;
                            stream.next()
                        }
                        if (stream.peek() === '"' || stream.peek() === "'") {
                            let quote = stream.peek();
                            stream.next()
                            while ((stream.peek() !== quote) && stream.next()) {
                            }
                            stream.next()
                        } else {
                            while (/[a-z0-9_A-Z$#@.]/.test(stream.peek()) && stream.next()) {
                            }
                        }
                        if (stream.peek() !== ']') {
                            return false;
                        }
                        stream.next()
                    }
                    if (doubleS) {
                        if (stream.peek() !== ']') {
                            return false;
                        }
                        stream.next()
                    }
                    return true;
                }

                state.lineNames = [];
                try {
                    stream.lineOracle.doc.cm.getValue().split("\n").forEach(function (line) {
                        if (line.trim().length === 0 || line.indexOf('//') === 0) return '';
                        if (!line.match(/\s*[a-zA-Z_0-9]+\s*=\s*[a-zA-Z0-9_]*:/)) return '';
                        return state.lineNames.push(line.replace(/^\s*~?\s*([a-zA-Z_0-9=]+).*/, '$1'));
                    });
                } catch (e) {

                }


                if (stream.pos === 0 || state.isStart === true) {
                    if (stream.string.match('^[\t\s]*\/\/')) {
                        stream.skipToEnd();
                        state.isStart = false;
                        return 'comment';
                    }
                    let classes = 'start';
                    state.isStart = true;

                    if (/[\t\n]/.test(stream.peek()) && stream.next()) {
                        while (/[\t\n]/.test(stream.peek()) && stream.next()) ;
                        return 'start-tabs';
                    }


                    if (stream.skipTo(':')) {
                        state.lineName = streamString().trim();
                        if (state.lineName.substring(0, 1) === '~') {
                            classes += " fixed";
                            state.lineName = state.lineName.substring(1);
                        }
                        state.lineName = state.lineName.replace(/=\s*[a-z0-9_]*\s*$/, '=');

                        if (/^\s*=\s*$|^\s*[a-z]{1,2}\d+=$/i.test(state.lineName)) {
                            classes += ' exec'
                        } else if (!/^[a-z0-9_]+$/i.test(state.lineName)) {
                            return error();
                        }
                        stream.next();
                    } else return error();

                    $(stream.lineOracle.doc.cm.getWrapperElement()).find('.cm-var-not-in').each(function () {
                        let text = $(this).text();
                        text = text.replace(/\[.*/, '');
                        if (text === '$' + state.lineName || text === '#$' + state.lineName || text === '$$' + state.lineName) {
                            $(this).removeClass('cm-var-not-in')
                        }
                    });

                    let matchesCount = state.lineNames.filter(function (v) {
                        return v === state.lineName
                    }).length;
                    if (matchesCount > 1) {
                        classes += " dubbled";
                    }
                    state.isStart = false;
                    return classes;
                }
                state.isStart = false;

                if (stream.match(/(math|json|str|cond)`[^`]*`/)) {
                    return "spec";
                } else {

                    switch (stream.peek()) {
                        case ' ':
                            stream.next();
                            return null;
                            break;

                        case '{':
                            stream.next();

                            if (stream.skipTo('}')) {
                                stream.next();
                            } else return error();

                            return "inVars";
                            break;

                        case '"':

                            let quote = stream.peek();
                            stream.next();

                            if (stream.skipTo(quote)) {
                                stream.next();
                            } else return error();
                            return "string";
                            break;
                        case '#':
                            stream.next();
                            let classes = 'db_name';

                            if (stream.peek() === '$') {
                                return classes;
                            }
                            stream.next();
                            let str;
                            while ((str = stream.string.substring(stream.start + 1, stream.pos + 1)) && /^[a-z0.-9_а-яА-Я]*$/.test(str) && stream.next()) {
                            }


                            if (!subFunc()) return error();

                            let varName = stream.string.substring(stream.start + 1, stream.pos).replace(/^([shcl]\.)?([a-z0-9_]+)$/, '$2');

                            if (varName !== 'n' && !/^[0-9a-z_]{2,}/.test(varName.replace(/\[.*/g, ''))) {
                                classes += ' tmp-error'
                            }

                            if (varName === "") return error();
                            return classes;
                            break;
                        case '@':
                            stream.next();
                            if (stream.peek() === '$') {
                                stream.next();
                                while (/[a-zA-Z0-9_]/.test(stream.peek()) && stream.next()) {
                                }
                                if (!subFunc()) return error();
                                return 'global-var'

                            }else {
                                let nS;
                                while (/[a-z0-9_.]/.test(nS = stream.peek()) && stream.next()) {
                                }
                                if (!subFunc()) return error();

                                let string = stream.string.substring(stream.start + 1, stream.pos)

                                if (/^[a-z0-9_]{3,}\.[a-z0-9_]{2,}(\[\[?([a-zA-Z0-9_\$\#]+|"[^"]+"|'[^']+')\]?\])*$/i.test(string)) {
                                    return "db_name";
                                }
                            }
                                return error();

                            break;
                        case '$':
                            stream.next();
                            if (stream.peek() === '@') {
                                stream.next();
                                while (/[a-zA-Z0-9_]/.test(stream.peek()) && stream.next()) {
                                }
                                if (!subFunc()) return error();
                                return 'process-var'

                            }
                            if (stream.peek() === '$') {
                                stream.next();
                            }

                            if (stream.peek() === '#') {
                                stream.next();
                                while (/[a-zA-Z0-9_]/.test(stream.peek()) && stream.next()) {
                                }
                                if (!subFunc()) return error();
                                return 'code-var'
                            } else {
                                while (/[a-zA-Z0-9_"]/i.test(stream.peek()) && stream.next()) {
                                }
                                if (!subFunc()) return error();

                                let variableName = stream.string.substring(stream.start, stream.pos);
                                variableName = variableName.replace(/\[.*/g, '');
                                let classes = 'variable';
                                let varName = variableName.substring(1);
                                if (varName[0] === '$') {
                                    classes += " dollar-dollar";

                                    varName = varName.substring(1);
                                }

                                if (state.lineNames.indexOf(varName) === -1) {
                                    classes += " var-not-in";
                                }
                                return classes;
                            }

                            break;

                        case 't':
                            if (stream.string.substring(stream.start, stream.start + 4) === 'true') {
                                stream.skipTo('e');
                                stream.next();
                                return "boolean";
                            }

                            break;

                        case 'f':
                            if (stream.string.substring(stream.start, stream.start + 5) === 'false') {
                                stream.skipTo('e');
                                stream.next();
                                return "boolean";
                            }
                            break;
                    }
                }

                state.inFuncName = false;
                if (!state.inFunction && /[a-zA-Z]/.test(stream.peek())) {

                    state.inFuncName = true;


                    if (!stream.skipTo('(')) {
                        stream.skipToEnd();
                    } else {
                        state.inFunction = true;

                    }

                    if (!/^[a-zA-Z]+[0-9]*\s*$/.test(streamString())) {
                        return error();
                    }
                    let func = TOTUMjsFuncs[streamString().trim().toLowerCase()];

                    if (!func) {
                        return error();
                    }

                    state.func = func;

                    stream.next();
                    return 'function';
                }

                if (state.inFunction) {

                    if (stream.peek() === ')') {
                        stream.next();
                        state.inFunction = false;
                        state.functionParam = '';
                        return 'function';
                    }

                    if (!state.functionParam && /[a-z_]/.test(stream.peek())) {
                        if (stream.skipTo(':')) {
                            let paramName = stream.string.substring(stream.start, stream.pos);
                            if (/^[a-z_]+\s*$/.test(paramName)) {
                                state.functionParam = paramName;
                                stream.next();
                                if (state.func[2].indexOf(paramName) === -1) return error();

                                let classes = 'functionParam';
                                if (DbFieldParams.indexOf(paramName) !== -1) {
                                    classes += ' fieldParam';
                                }
                                if (state.func[3].indexOf(paramName) !== -1) {
                                    classes += ' reqParam';
                                }
                                if (state.func[4] && state.func[4].indexOf(paramName) !== -1) {
                                    classes += ' multiParam';
                                }
                                return classes;
                            } else return error();
                        } else {
                            if (stream.skipTo(')')) {
                                return 'error fieldParam';
                            } else return error();
                        }
                    }
                    if (!state.functionParam) {
                        return error();
                    }

                    if (stream.peek() === ';') {
                        stream.next();

                        state.functionParam = '';
                        return '';
                    }

                    if (state.functionParam === 'order' && /[ad]/.test(stream.peek())) {
                        if (stream.string.substring(stream.start, stream.start + 3) === 'asc') {
                            stream.next();
                            stream.next();
                            stream.next();
                            return '';
                        } else if (stream.string.substring(stream.start, stream.start + 4) === 'desc') {
                            stream.next();
                            stream.next();
                            stream.next();
                            stream.next();
                            return '';
                        }

                    }

                    if (stream.peek() === "'") {
                        let quote = stream.peek();
                        stream.next();

                        if (stream.skipTo(quote)) {
                            stream.next();
                        } else return error();
                        return "string-name";
                    }


                }


                if (stream.peek() === "'") {
                    let quote = stream.peek();
                    stream.next();

                    if (stream.skipTo(quote)) {
                        stream.next();
                    } else return error();
                    return "string";
                }

                if (/\d|%/.test(stream.peek())) {
                    stream.next();

                    while (/[0-9.%]/.test(stream.peek()) && stream.next()) {
                    }
                    if (!/^\d+(\.\d+)?%?$/.test(stream.string.substring(stream.start, stream.pos))) {
                        return error();
                    }
                    return "number";
                }
                if (/[\^+-\/*!<>=]/.test(stream.peek())) {
                    stream.next();
                    return "operator";
                }


                return error();
            }
        };
    });

    function autoCloseS(cm) {
        if (cm.getOption("disableInput") || cm.getOption("mode") !== 'totum') return CodeMirror.Pass;
        var ranges = cm.listSelections(), replacements = [];
        let openHints = false;
        for (let i = 0; i < ranges.length; i++) {
            if (!ranges[i].empty()) return CodeMirror.Pass;
            var pos = ranges[i].head, tok = cm.getTokenAt(pos, true);


            if ((tok.state && tok.state.inFuncName) || tok.type == 'function' || tok.type == 'error') {
                let func;
                let lower = tok.string.toLowerCase();
                let params = '';

                let delimiter;
                if (lower.indexOf('/') !== -1) {
                    func = lower.substring(0, lower.indexOf('/'));
                    params = lower.substring(lower.indexOf('/'));
                    delimiter = '/';
                } else if (lower.indexOf(';') !== -1) {
                    func = lower.substring(0, lower.indexOf(';'));
                    params = lower.substring(lower.indexOf(';'));
                    delimiter = ';';
                } else func = lower.trimRight();


                if (func = TOTUMjsFuncs[func]) {
                    let replaceText = '';
                    let newPosition = 0;
                    if (params.length) {
                        replaceText = '(';
                        let firstParamCh = 1;
                        let isFirst = true;
                        params.split(delimiter).forEach(function (str) {
                            if (str.length === 0) ;
                            else {
                                if (!isFirst) {
                                    replaceText += '; ';
                                }
                                isFirst = false;
                                let fulled = str.indexOf(':') !== -1 && (str.slice(str.indexOf(':') + 1).trim() !== "");
                                replaceText += str + (str.indexOf(':') === -1 ? ': ' : '');

                                if (firstParamCh === 1 && !fulled) {
                                    firstParamCh = replaceText.length;
                                }
                            }
                        });

                        if (firstParamCh === 1) {
                            firstParamCh = replaceText.length;
                        } else {
                            openHints = true;
                        }

                        newPosition += firstParamCh;
                        replaceText += ')';

                    } else {
                        replaceText = func[0];
                        if (!/:/.test(replaceText)) newPosition += replaceText.length;
                        else {
                            let _firstParamCh = replaceText.indexOf(':');
                            let _firstParamStartStr = replaceText.substring(_firstParamCh);
                            let _firstParamStr = _firstParamStartStr.substring(0, _firstParamStartStr.indexOf(';') || _firstParamStartStr.indexOf(')'));

                            newPosition += _firstParamCh;

                            if (_firstParamStr.indexOf("'") !== -1) {
                                newPosition += _firstParamStr.indexOf("'") + 1;
                            } else {
                                newPosition += 2;
                            }
                            openHints = true;
                        }


                    }
                    replacements[i] = {
                        text: replaceText,
                        newPos: CodeMirror.Pos(pos.line, pos.ch - params.length + newPosition),
                        replace: CodeMirror.Pos(pos.line, pos.ch - params.length)
                    };
                } else {
                    replacements[i] = {
                        text: "()",
                        newPos: CodeMirror.Pos(pos.line, pos.ch + 1),
                        replace: CodeMirror.Pos(pos.line, pos.ch)
                    };
                }
                let info = replacements[i];
                if (info) {
                    cm.replaceRange(info.text, info.replace, ranges[i].anchor, "+insert");
                    var sel = cm.listSelections().slice(0);
                    sel[i] = {head: info.newPos, anchor: info.newPos};
                    cm.setSelections(sel);
                    if (openHints) {
                        CodeMirror.showHint(cm, CodeMirror.hint.totumVars, {});
                    }
                }
            } else {
                cm.replaceRange("()", CodeMirror.Pos(pos.line, pos.ch), ranges[i].anchor);
                cm.setSelections([{
                    head: CodeMirror.Pos(pos.line, pos.ch + 1),
                    anchor: CodeMirror.Pos(pos.line, pos.ch + 1)
                }]);
            }
        }


    }

    CodeMirror.registerHelper("hint", "totumVars", function javascriptHint(editor, options) {
        return scriptHint(editor, totumKeywords,
            function (e, cur) {
                return e.getTokenAt(cur);
            },
            options);
    });

    let AllTables = [];
    let tablesQueried = false;
    let lastQuery = null;

    const getTables = function () {
        if (!lastQuery || lastQuery < Math.floor(Date.now() / 1000) - 40) {
            lastQuery = Math.floor(Date.now() / 1000);
            AllTables = [];
        }
        if (AllTables.length === 0 && !tablesQueried) {
            tablesQueried = true;
            let pcTable = $('#table').data('pctable');
            if (pcTable && pcTable.isCreatorView) {
                pcTable.model.getAllTables().then(function (json) {
                    AllTables = json.tables;
                    tablesQueried = false;
                })
            }
        }
        return AllTables;
    };
    const renderHint = function (el, data, row) {
        $(el).append('<span class="' + row.type + '">' + (row.textVis || row.text) + (row.title === "" ? '' : ' <span class="descr">' + row.title + '</span>') + '</span>')
    };

    function scriptHint(editor, keywords, getToken, options) {
        // Find the token at the cursor
        var cur = editor.getCursor(), token = getToken(editor, cur), line = editor.getLine(cur.line), start;

        if (token.type !== 'string-name' && /\b(?:string|comment)\b/.test(token.type)) return;


        var innerMode = CodeMirror.innerMode(editor.getMode(), token.state);
        if (innerMode.mode.helperType === "json") return;
        token.state = innerMode.state;

        token.inString = token.string;

        token.state.isDb_name = false;
        token.state.showAll = true;


        options.inStart = true;

        let hintFunc = function (cm, data, completion) {
            if (completion !== undefined && completion !== null) {
                cm.replaceRange(completion.text || completion, data.from, data.to);

                if (completion.curPos) {
                    cm.setCursor({line: data.from.line, ch: completion.curPos});

                }
                if (completion.showHint) {
                    CodeMirror.showHint(cm, CodeMirror.hint.totumVars, {});
                }
            }
        };

        let match, $math = {
            text: 'math``',
            textVis: 'math``'
            , title: '',
            render: renderHint, type: '', curPos: token.start + 5, hint: hintFunc,
            tab: true
        }, $json = {
            text: 'json``',
            textVis: 'json``'
            , title: '',
            render: renderHint, type: '', curPos: token.start + 5, hint: hintFunc,
            tab: true
        }, $cond = {
            text: 'cond``',
            textVis: 'cond``'
            , title: '',
            render: renderHint, type: '', curPos: token.start + 5, hint: hintFunc,
            tab: true
        }, $str = {
            text: 'str``',
            textVis: 'str``'
            , title: '',
            render: renderHint, type: '', curPos: token.start + 4, hint: hintFunc,
            tab: true
        };

        keywords = keywords.slice();
        if (token.state.isStart || cur.ch === 0) {
            keywords = [];
            token.string = token.string.replace(/^[\t]+/, '');
            let tilda = '';
            if (/^~/.test(token.string)) {
                token.string.replace(/^~/, '');
                tilda = '~';
            }
            $(editor.getWrapperElement()).find('.cm-var-not-in').each(function () {
                let text = $(this).text().replace(/^(\#|\$)?\$/, '').replace(/\[.*/, '');

                keywords.push({text: tilda + text + ': ', displayText: text});
            });


        } else if (token.type === 'error' && token.state.func && token.state.func[2].length && [";", "/"].indexOf(line[token.start]) !== -1) {
            keywords = [];

            start = token.string.substr(0, cur.ch - token.start).replace(/^[;\/]+([a-z_]*).*/, '$1')
            let end = token.string.substr(cur.ch - token.start).replace(/^[;\/]+[a-z_]*(.*)/, '$1')

            token.state.func[2].forEach(function (fName) {

                let type = '';
                let zpt = '';

                if ([";", ")"].indexOf(end.trim()[0]) !== -1) zpt = end;
                else if (end.match(/[)]/)) zpt = ';' + end;

                if (token.state.func[3].indexOf(fName) !== -1) type += ' item-reqParam';
                if (token.state.func[4].indexOf(fName) !== -1) type += ' item-multiParam';
                if (DbFieldParams.indexOf(fName) !== -1) type += ' item-fieldParam';

                let st = "";
                if (["(", " "].indexOf(line[token.start - 1]) === -1) {
                    st = " ";
                }

                keywords.push({
                    text: st + fName + ': ' + zpt,
                    textVis: fName,
                    title: "",
                    render: renderHint,
                    type: type,
                    hint: hintFunc,
                    curPos: token.start + st.length + (fName + ': ' + zpt).length - zpt.length
                });
            })
        } else if (/^'.*?'?$/.test(token.string) && DbFieldParams.indexOf(token.state.functionParam) !== -1) {

            token.state.showAll = true;

            if (token.string === "''") {
                token.end = token.end;
                token.start += 1;
                token.string = '';
            } else {
                if (/'[a-z_0-9]+'/.test(token.string)) {
                    token.start += 1;
                    token.string = token.string.slice(1, cur.ch - token.start);
                } else {

                    token.string = token.string.slice(1, cur.ch - token.start);
                    token.start += 1;
                    token.end = cur.ch;

                    if (editor.getLine(cur.line)[cur.ch] === "'") {
                        token.end++;
                    }
                }


            }


            if (token.state.functionParam === 'table') {
                let tables = getTables();
                keywords = [];

                Object.keys(tables).forEach(function (name) {
                    keywords.push({
                        text: name + "'",
                        textVis: name,
                        title: tables[name].t,
                        render: renderHint,
                        type: 'item-string-name',
                        hint: hintFunc,
                        tab: true
                    })
                });

            } else {
                let line = editor.getLine(cur.line);
                let str = line.substring(0, cur.ch);
                let lastPart = line.substring(cur.ch);
                let q = lastPart.substring(0, lastPart.indexOf(')'));
                str = str.substring(str.lastIndexOf('(')) + q;
                let tblMatch;
                if (tblMatch = str.match(/table:\s*((\$#ntn)|'([a-z_0-9]*)')/)) {
                    let tableName = tblMatch[2] ? editor.table : tblMatch[3];

                    keywords = [];
                    Object.keys(AllTables[tableName].f).forEach(function (fName) {
                        keywords.push({
                            text: fName + "'",
                            textVis: fName,
                            title: AllTables[tableName].f[fName],
                            render: renderHint,
                            type: 'item-string-name', curPos: cur.ch + fName.length + 1,
                            tab: true
                        });
                    });

                    keywords.push({
                        text: 'id' + "'",
                        textVis: 'id'
                        , title: '', render: renderHint, type: 'item-string-name', curPos: cur.ch + 3,
                        tab: true
                    })
                }
            }


        } else {


            if (token.end > cur.ch) {
                token.end = cur.ch;
                token.string = token.string.slice(0, cur.ch - token.start);
            }

            /* @ */
            if (token.string.indexOf('@') === 0) {
                options.inStart = false;
                keywords = [];
                let tables = getTables();
                let matches;


                token.string = token.string.slice(1, cur.ch - token.start);
                token.start = token.start + 1;
                token.end = cur.ch;

                if (matches = token.string.match(/^([a-z_0-9]+)\./)) {
                    let tName = matches[1];

                    token.start += (tName + '.').length;
                    token.string = token.string.slice((tName + '.').length);


                    if (tables[tName] && tables[tName]["@"].length) {
                        tables[tName]["@"].forEach(function (fName) {
                            keywords.push({
                                text: fName,
                                title: tables[tName].f[fName],
                                render: renderHint,
                                type: 'item-db_name'
                            })
                        });
                    }

                } else {

                    Object.keys(tables).forEach(function (tName) {
                        if (tables[tName]["@"].length) {
                            keywords.push({
                                text: tName + '.',
                                textVis: tName,
                                title: tables[tName].t,
                                render: renderHint,
                                type: 'item-db_name',
                                showHint: true,
                                hint: hintFunc
                            })
                        }
                    });
                }

            } else if (token.string.slice(0, 2) === '$#') {

                keywords = [
                    {text: "$#lc", title: 'Пустой лист', render: renderHint, type: 'item-code-var'},
                    {text: "$#nd", title: 'дата - Y-m-d', render: renderHint, type: 'item-code-var'}, //, hint: function (cm, data, completion) {}
                    {text: "$#ndt", title: 'дата-время - Y-m-d H:i', render: renderHint, type: 'item-code-var'},
                    {
                        text: "$#ndts",
                        title: 'дата-время с секундами - Y-m-d H:i:s',
                        render: renderHint,
                        type: 'item-code-var'
                    },
                    {text: "$#nu", title: 'id пользователя', render: renderHint, type: 'item-code-var'},
                    {text: "$#nr", title: 'ids ролей пользователя', render: renderHint, type: 'item-code-var'},
                    {text: "$#nti", title: 'id таблицы', render: renderHint, type: 'item-code-var'},
                    {text: "$#ntn", title: 'NAME таблицы', render: renderHint, type: 'item-code-var'},
                    {text: "$#nth", title: 'HASH врем. таблицы', render: renderHint, type: 'item-code-var'},
                    {text: "$#ih", title: 'HASH строки добавления', render: renderHint, type: 'item-code-var'},
                    {text: "$#nci", title: 'Cycle расчетной таблицы', render: renderHint, type: 'item-code-var'},
                    {text: "$#nf", title: 'NAME поля', render: renderHint, type: 'item-code-var'},
                    {text: "$#nl", title: 'Новая строка', render: renderHint, type: 'item-code-var'},
                    {text: "$#tb", title: 'Табуляция', render: renderHint, type: 'item-code-var'},
                    {text: "$#tpa", title: 'Тип экшена код действия', render: renderHint, type: 'item-code-var'},
                    {text: "$#ids", title: 'id отмеченных галочками полей', render: renderHint, type: 'item-code-var'},
                    {
                        text: "$#nfv",
                        title: 'Значение текущего поля (для селектов/действий/форматов)',
                        render: renderHint,
                        type: 'item-code-var'
                    },
                    {
                        text: "$#onfv",
                        title: 'Прошлое значение текущего поля',
                        render: renderHint,
                        type: 'item-code-var'
                    },
                    {text: "$#nh", title: 'Текущий хост-name', render: renderHint, type: 'item-code-var'},
                    {
                        text: "$#duplicatedId",
                        title: 'Ид дублированной строки',
                        render: renderHint,
                        type: 'item-code-var'
                    },
                ];

                const funcSort = function (firsts) {
                    let sort = keywords.slice();
                    let firstsFull = [];
                    sort = sort.filter(function (v) {
                        if (firsts.indexOf(v.text) === -1) return true;
                        else firstsFull.push(v)
                    });
                    return sort = firstsFull.concat(sort);
                };

                switch (token.state.functionParam) {
                    case 'table':
                        keywords = funcSort(['$#ntn']);
                        break;
                    case 'cycle':
                        keywords = funcSort(['$#nci']);
                        break;
                    case 'field':
                        keywords = funcSort(['$#nf', '$#nfv']);
                        break;
                }


            } else if (match = token.string.match(/^(#?\$)/)) {

                keywords = [];
                token.string = token.string.slice(match[1].length, cur.ch - token.start);
                token.start = token.start + match[1].length;
                token.end = cur.ch;

                token.state.lineNames.forEach(function (name) {
                    if (name.indexOf('=') === -1) {
                        keywords.push(name);
                    }
                });

            } else if (match = token.string.match(/^\#/)) {

                keywords = [];
                token.string = token.string.slice(1, cur.ch - token.start);
                token.start = token.start + 1;
                token.end = cur.ch;

                if (match = token.string.match(/^([a-z]{1,3}\.)/)) {
                    token.string = token.string.slice(match[1].length);
                    token.start += match[1].length;
                }

                if (editor.table && AllTables[editor.table]) {
                    Object.keys(AllTables[editor.table].f).forEach(function (fName) {
                        keywords.push({
                            text: fName,
                            title: AllTables[editor.table].f[fName],
                            render: renderHint,
                            type: 'item-db-name'
                        });
                    });
                    keywords.push({
                        text: 'id',
                        title: '',
                        render: renderHint,
                        type: 'item-db-name'
                    });
                }

            } else if (token.state.inFuncName) {
                if (!token.state.inFunction) {
                    if (match = token.string.match(/^([a-zA-Z]+)([\/;])/)) {
                        let func;
                        token.state.showAll = true;

                        if (func = TOTUMjsFuncs[match[1].toLowerCase()]) {
                            let oldStart = token.start;
                            token.start = token.start + token.string.lastIndexOf(match[2]) + 1;
                            token.string = token.string.slice(token.string.lastIndexOf(match[2]) + 1, cur.ch - oldStart);
                            token.end = cur.ch;
                            keywords = [];
                            func[2].forEach(function (fName) {
                                let type = '';
                                if (func[3].indexOf(fName) !== -1) type += ' item-reqParam';
                                if (func[4].indexOf(fName) !== -1) type += ' item-multiParam';
                                if (DbFieldParams.indexOf(fName) !== -1) type += ' item-fieldParam';

                                keywords.push({
                                    text: fName + ': ',
                                    textVis: fName,
                                    title: "",
                                    render: renderHint,
                                    type: type
                                });
                            })

                        }
                    } else {
                        keywords = ActiveFuncNames.slice();
                        keywords.push('true');
                        keywords.push('false')
                        keywords.unshift($math)
                        keywords.unshift($json)
                        keywords.unshift($cond)
                        keywords.unshift($str)
                    }
                }
            } else if (token.state.func && (token.type === 'error fieldParam' || /(\(|;\s*)$/.test(editor.getLine(cur.line).slice(0, token.start)))) {
                keywords = [];

                token.state.func[2].forEach(function (fName) {

                    let type = '';
                    let zpt = '';

                    if (editor.getLine(cur.line).slice(cur.ch).trim() !== ')') zpt = '; ';

                    if (token.state.func[3].indexOf(fName) !== -1) type += ' item-reqParam';
                    if (token.state.func[4].indexOf(fName) !== -1) type += ' item-multiParam';
                    if (DbFieldParams.indexOf(fName) !== -1) type += ' item-fieldParam';

                    keywords.push({
                        text: fName + ': ' + zpt,
                        textVis: fName,
                        title: "",
                        render: renderHint,
                        type: type,
                        hint: hintFunc,
                        curPos: token.start + (fName + ': ' + zpt).length - zpt.length
                    });
                })
            } else {

                keywords = [
                    'true',
                    'false'

                ];
                if (token.state.functionParam === 'order') {
                    keywords = keywords.concat(['asc', 'desc'])
                }
            }

        }

        return {
            list: getCompletions(token, keywords, options, start),
            from: CodeMirror.Pos(cur.line, token.start),
            to: CodeMirror.Pos(cur.line, token.end)
        };
    }

    let totumKeywords = [];


    /*var fooHint = CodeMirror.hint.foo;
    CodeMirror.hint.foo = function(cm, options) {
        var result = fooHint(cm, options);
        if (result)
        return result;
    });*/

    let totumAutoCloses = function (cm) {
        getTables();

        var map = {name: "autoCloseFunctions"};
        map["'('"] = autoCloseS;
        map["')'"] = autoCloseS;
        cm.addKeyMap(map);

        cm.on('keydown', function (cm, event) {
            if ((event.keyCode || event.which).toString() === '9') {
                if (TotumTab(cm, event.altKey, event.shiftKey)) {

                    event.preventDefault();
                }
            }
        });

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
                if (typeof cm.options.bigOneDialog === 'function') {
                    cm.options.bigOneDialog();
                } else {
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
        cm.on('dblclick', function (event) {
            var cur = cm.getCursor(), token = cm.getTokenAt(cur).state;
            let name;
            let wrapper = $(cm.getWrapperElement());
            let line = cm.getLine(cur.line);
            let startVal = line.substring(0, cur.ch);

            if (/^\s*~?\s*?[a-zA-Z0-9_]+$/.test(startVal)) {
                name = token.lineName;
            } else {
                let pos = cur.ch - 1;
                if (/[a-zA-Z0-9_]/.test(line[pos])) {
                    while (--pos && pos >= 0 && /[a-zA-Z0-9_]/.test(line[pos])) ;
                    if (line[pos] === '$') {
                        let start = pos + 1;
                        pos = cur.ch - 1;
                        while (++pos && line.length > pos && /[a-zA-Z0-9_]/.test(line[pos])) ;
                        name = line.substring(start, pos);
                    }
                }

            }

            if (name) {
                let regTest = new RegExp('^\s*~?\s*' + name + '\s*:');

                if (regTest.test(wrapper.find('.cm-start.light').text())) {
                    wrapper.find('.light').removeClass('light');
                } else {
                    wrapper.find('.light').removeClass('light');
                    let reg = new RegExp("\\$" + name + '\\b');


                    wrapper.find('.cm-variable,.cm-inVars,.cm-spec,.cm-db_name').each(function () {
                        let cmVar = $(this);
                        if (cmVar.text().match(reg)) {
                            cmVar.addClass('light');
                        }
                    });
                    wrapper.find('.cm-start').each(function () {
                        let cmVar = $(this);
                        if (cmVar.text().trim().replace('~', '').replace(':', '') === name) {
                            cmVar.addClass('light');
                        }
                    })
                }
            }

        });
    }


    CodeMirror.defineOption("autoCloseFunctions", false, function (cm) {
        if (cm.getOption('mode') === 'totum') totumAutoCloses(cm);
        if (cm.getOption('mode') === 'sections') CodeMirror.sectionsAutoCloses(cm);


    });

    (function () {
        "use strict";

        CodeMirror.showHint = function (cm, getHints, options) {
            /*setTimeout(()=>{
                debugger
            }, 1000)*/

            // We want a single cursor position.
            if (cm.somethingSelected()) return;
            if (getHints == null) getHints = cm.getHelper(cm.getCursor(), "hint");
            if (getHints == null) return;

            if (cm.state.completionActive) cm.state.completionActive.close();

            var completion = cm.state.completionActive = new Completion(cm, getHints, options || {});
            CodeMirror.signal(cm, "startCompletion", cm);
            if (completion.options.async)
                getHints(cm, function (hints) {
                    completion.showHints(hints);
                }, completion.options);
            else
                return completion.showHints(getHints(cm, completion.options));

        };

        CodeMirror.commentMe = function (cm) {
            var cur = cm.getCursor(), token = cm.getTokenAt(cur).state, line = cm.lineInfo(cur.line);
            let comment;
            if (comment = line.text.match(/^([\t\s]*)\/\//)) {
                cm.replaceRange("", {line: cur.line, ch: comment[1].length}, {line: cur.line, ch: comment[0].length});
            } else {
                comment = line.text.match(/^[\t\s]*/);
                cm.replaceRange("//", {line: cur.line, ch: comment[0].length}, {line: cur.line, ch: comment[0].length});
            }
        };

        function Completion(cm, getHints, options) {
            this.cm = cm;
            this.getHints = getHints;
            this.options = options;
            this.widget = this.onClose = null;
        }

        Completion.prototype = {
            close: function () {
                if (!this.active()) return;

                if (this.widget) this.widget.close();
                if (this.onClose) this.onClose();
                this.cm.state.completionActive = null;
                CodeMirror.signal(this.cm, "endCompletion", this.cm);
            },

            active: function () {
                return this.cm.state.completionActive == this;
            },

            pick: function (data, i) {
                var completion = data.list[i];
                if (completion.hint) completion.hint(this.cm, data, completion);
                else this.cm.replaceRange(getText(completion), data.from, data.to);
                this.close();
                let cm = this.cm;
            },

            showHints: function (data) {
                if (!data || !data.list.length || !this.active()) return this.close();
                this.showWidget(data);
            },

            showWidget: function (data) {
                this.widget = new Widget(this, data);
                CodeMirror.signal(data, "shown");

                var debounce = null, completion = this, finished;
                var closeOn = this.options.closeCharacters || /[\s()\[\]{};:>,]/;
                var startPos = this.cm.getCursor(), startLen = this.cm.getLine(startPos.line).length;

                function done() {
                    if (finished) return;
                    finished = true;
                    completion.close();
                    completion.cm.off("cursorActivity", activity);
                    CodeMirror.signal(data, "close");
                }

                function isDone() {
                    if (finished) return true;
                    if (!completion.widget) {
                        done();
                        return true;
                    }
                }

                function update() {
                    if (isDone()) return;
                    if (completion.options.async)
                        completion.getHints(completion.cm, finishUpdate, completion.options);
                    else
                        finishUpdate(completion.getHints(completion.cm, completion.options));
                }

                function finishUpdate(data) {
                    if (isDone()) return;
                    if (!data || !data.list.length) return done();
                    completion.widget.close();
                    completion.widget = new Widget(completion, data);
                }

                function activity() {
                    clearTimeout(debounce);
                    var pos = completion.cm.getCursor(), line = completion.cm.getLine(pos.line);
                    if (pos.line != startPos.line || line.length - pos.ch != startLen - startPos.ch ||
                        pos.ch < startPos.ch || completion.cm.somethingSelected() ||
                        (pos.ch && closeOn.test(line.charAt(pos.ch - 1))))
                        completion.close();
                    else
                        debounce = setTimeout(update, 170);
                }

                this.cm.on("cursorActivity", activity);
                this.onClose = done;
            }
        };

        function getText(completion) {
            if (typeof completion == "string") return completion;
            else return completion.text;
        }

        function buildKeyMap(options, handle) {
            var baseMap = {
                Up: function () {
                    handle.moveFocus(-1);
                },
                Down: function () {
                    handle.moveFocus(1);
                },
                PageUp: function () {
                    handle.moveFocus(-handle.menuSize());
                },
                PageDown: function () {
                    handle.moveFocus(handle.menuSize());
                },
                Home: function () {
                    handle.setFocus(0);
                },
                End: function () {
                    handle.setFocus(handle.length);
                },
                Enter: handle.pick,
                Esc: handle.close
            };
            var ourMap = options.customKeys ? {} : baseMap;

            function addBinding(key, val) {
                var bound;
                if (typeof val != "string")
                    bound = function (cm) {
                        return val(cm, handle);
                    };
                // This mechanism is deprecated
                else if (baseMap.hasOwnProperty(val))
                    bound = baseMap[val];
                else
                    bound = val;
                ourMap[key] = bound;
            }

            if (options.customKeys)
                for (var key in options.customKeys) if (options.customKeys.hasOwnProperty(key))
                    addBinding(key, options.customKeys[key]);
            if (options.extraKeys)
                for (var key in options.extraKeys) if (options.extraKeys.hasOwnProperty(key))
                    addBinding(key, options.extraKeys[key]);
            return ourMap;
        }

        function Widget(completion, data) {
            this.completion = completion;
            this.data = data;
            var widget = this, cm = completion.cm, options = completion.options;

            var hints = this.hints = window.top.document.createElement("ul");
            hints.className = "CodeMirror-hints";
            this.selectedHint = 0;

            var completions = data.list;
            for (var i = 0; i < completions.length; ++i) {
                var elt = hints.appendChild(window.top.document.createElement("li")), cur = completions[i];
                var className = "CodeMirror-hint" + (i ? "" : " CodeMirror-hint-active");
                if (cur.className != null) className = cur.className + " " + className;
                elt.className = className;
                if (cur.render) cur.render(elt, data, cur);
                else elt.appendChild(window.top.document.createTextNode(cur.displayText || getText(cur)));
                elt.hintId = i;
            }

            var pos = cm.cursorCoords(options.alignWithWord !== false ? data.from : null);
            var left = pos.left, top = pos.bottom + 3, below = true;
            hints.style.left = left + "px";
            hints.style.top = top + "px";
            // If we're at the edge of the screen, then we want the menu to appear on the left of the cursor.
            var winW = window.innerWidth || Math.max(window.top.document.body.offsetWidth, window.top.document.documentElement.offsetWidth);
            var winH = window.innerHeight || Math.max(window.top.document.body.offsetHeight, window.top.document.documentElement.offsetHeight);
            var box = hints.getBoundingClientRect();
            var overlapX = box.right - winW, overlapY = box.bottom - winH;
            if (overlapX > 0) {
                if (box.right - box.left > winW) {
                    hints.style.width = (winW - 5) + "px";
                    overlapX -= (box.right - box.left) - winW;
                }
                hints.style.left = (left = pos.left - overlapX) + "px";
            }
            if (overlapY > 0) {
                var height = box.bottom - box.top;
                if (box.top - (pos.bottom - pos.top) - height > 0) {
                    overlapY = height + (pos.bottom - pos.top);
                    below = false;
                } else if (height > winH) {
                    hints.style.height = (winH - 5) + "px";
                    overlapY -= height - winH;
                }
                hints.style.top = (top = pos.bottom - overlapY) + "px";
            }

            (options.container || window.top.document.body).appendChild(hints);

            cm.addKeyMap(this.keyMap = buildKeyMap(options, {
                moveFocus: function (n) {
                    widget.changeActive(widget.selectedHint + n);
                },
                setFocus: function (n) {
                    widget.changeActive(n);
                },
                menuSize: function () {
                    return widget.screenAmount();
                },
                length: completions.length,
                close: function () {
                    completion.close();
                },
                pick: function () {
                    widget.pick();
                }
            }));

            if (options.closeOnUnfocus !== false) {
                var closingOnBlur;
                cm.on("blur", this.onBlur = function () {
                    closingOnBlur = setTimeout(function () {
                        completion.close();
                    }, 100);
                });
                cm.on("focus", this.onFocus = function () {
                    clearTimeout(closingOnBlur);
                });
            }

            var startScroll = cm.getScrollInfo();
            cm.on("scroll", this.onScroll = function () {
                var curScroll = cm.getScrollInfo(), editor = cm.getWrapperElement().getBoundingClientRect();
                var newTop = top + startScroll.top - curScroll.top;
                var point = newTop - (window.pageYOffset || (window.top.document.documentElement || window.top.document.body).scrollTop);
                if (!below) point += hints.offsetHeight;
                if (point <= editor.top || point >= editor.bottom) return completion.close();
                hints.style.top = newTop + "px";
                hints.style.left = (left + startScroll.left - curScroll.left) + "px";
            });

            CodeMirror.on(hints, "click", function (e) {
                var t = e.target || e.srcElement;
                while (t.nodeName === 'SPAN') t = t.parentNode;
                if (t.hintId != null) {
                    widget.changeActive(t.hintId);
                    widget.pick();
                }
            });
            /*CodeMirror.on(hints, "click", function (e) {
                var t = e.target || e.srcElement;
                while (t.nodeName ==='SPAN') t = t.parentNode;

                if (t.hintId != null) widget.changeActive(t.hintId);
            });*/
            CodeMirror.on(hints, "mousedown", function () {
                setTimeout(function () {
                    cm.focus();
                }, 20);
            });

            CodeMirror.signal(data, "select", completions[0], hints.firstChild);
            return true;
        }

        Widget.prototype = {
            close: function () {
                if (this.completion.widget != this) return;
                this.completion.widget = null;
                this.hints.parentNode.removeChild(this.hints);
                this.completion.cm.removeKeyMap(this.keyMap);

                var cm = this.completion.cm;
                if (this.completion.options.closeOnUnfocus !== false) {
                    cm.off("blur", this.onBlur);
                    cm.off("focus", this.onFocus);
                }
                cm.off("scroll", this.onScroll);
            },

            pick: function () {
                this.completion.pick(this.data, this.selectedHint);
            },

            changeActive: function (i) {
                i = Math.max(0, Math.min(i, this.data.list.length - 1));
                if (this.selectedHint == i) return;
                var node = this.hints.childNodes[this.selectedHint];
                node.className = node.className.replace(" CodeMirror-hint-active", "");
                node = this.hints.childNodes[this.selectedHint = i];
                node.className += " CodeMirror-hint-active";
                if (node.offsetTop < this.hints.scrollTop)
                    this.hints.scrollTop = node.offsetTop - 3;
                else if (node.offsetTop + node.offsetHeight > this.hints.scrollTop + this.hints.clientHeight)
                    this.hints.scrollTop = node.offsetTop + node.offsetHeight - this.hints.clientHeight + 3;
                CodeMirror.signal(this.data, "select", this.data.list[this.selectedHint], node);
            },

            screenAmount: function () {
                return Math.floor(this.hints.clientHeight / this.hints.firstChild.offsetHeight) || 1;
            }
        };
    })();

    function getCompletions(token, keywords, options, start) {
        var foundStart = [],
            foundOther = [],
            start = start === undefined ? token.string.toLowerCase() : start,
            global = options && options.globalScope || window;

        if (!token.state.showAll && start === "") return found;

        function maybeAdd(str) {
            let testStr, testStrRus = "";
            if (typeof str === "string") {
                testStr = str.toLowerCase();
            } else {
                testStr = str.text.toLowerCase();
                if (str.title) {
                    testStrRus = str.title.toLowerCase();
                }
            }

            if (!arrayContains(foundStart, testStr) && !arrayContains(foundOther, testStr)) {
                let tLeft;

                if (testStr.lastIndexOf(start, 0) === 0) foundStart.push(str);
                else if (testStrRus.lastIndexOf(start, 0) === 0) foundStart.push(str);
                else if (testStrRus.indexOf(start, 0) !== -1) foundOther.push(str);
                else if (!options.inStart && testStr.indexOf(start) !== -1) foundOther.push(str);
            }
        }

        keywords.forEach(maybeAdd);

        if (foundStart.length === 1 && foundStart[0] === start) return [];
        if (foundStart.length === 1 && foundStart[0].text === start) return [];
        if (foundOther.length === 1 && foundOther[0] === start) return [];
        if (foundOther.length === 1 && foundOther[0].text === start) return [];

        return foundStart.concat(foundOther);
    }

    function arrayContains(arr, item) {
        return arr.indexOf(item) !== -1;
    }

})();