import TotumModel from "./TotumModel";
import {TotumForm} from "./components/TotumForm";
import {Trobber} from "./components/Trobber";

import {createMuiTheme} from '@material-ui/core/styles';
import {ThemeProvider} from '@material-ui/styles';

import {ruLang} from './components/lang/ru.js'

const theme = createMuiTheme({
    typography: {
        fontSize: 16,
        fontFamily: [
            'IBM Plex Sans',
            'Helvetica',
            'Arial',
            'sans-serif'
        ].join(','),
    }
});


let React = require('react');
let ReactDom = require('react-dom');


window.ttmForm = function (div, form_address, sess_hash_in, post, get, input) {
    if (!form_address) console.log('Do not correct form path');
    div.classList.add("ttm-form");

    let params_string = "ttm-form-cache:" + JSON.stringify([form_address, post, get, input]);
    let sess_hash, model, error;

    if (sess_hash_in) {
        if (sess_hash_in === true) {
            sess_hash = localStorage.getItem(params_string)
        } else {
            sess_hash = sess_hash_in
        }
    }

    if (sess_hash) {
        model = new TotumModel(form_address, sess_hash);
        if (sess_hash_in === true) {
            model.resetSessHash = () => {
                localStorage.removeItem(params_string);
            }
        }

    } else {
        model = new TotumModel(form_address);
    }

    let resolve, reject;
    let prms = new Promise((r1, r2) => {
        resolve = r1;
        reject = r2;
    })

    const renderError = function (error) {
        console.log(error);
        error = error.replace(/\[\[/g, '').replace(/\]\]/g, '');
        ReactDom.render(<div className="error">{error.toString()}</div>, div);
        reject();
    }


    model.load(post, get, input).then((json) => {

        if (json.settings && window.MAIN_HOST_FORM) {
            if (json.settings.__browser_title) {
                document.title = json.settings.__browser_title;
            }
            if (json.settings.__background) {
                document.body.style.backgroundImage = "url('" + json.settings.__background + "')";
            }
            if (json.settings.__form_width) {
                document.getElementById('form').style.maxWidth = json.settings.__form_width + 'px';
            }
            if (json.settings.__css) {
                let style = document.createElement('style');
                document.head.appendChild(style);
                style.type = 'text/css';
                if (style.styleSheet) {
                    // This is required for IE8 and below.
                    style.styleSheet.cssText = css;
                } else {
                    style.appendChild(document.createTextNode(json.settings.__css));
                }
            }
        }

        if (json.error) {
            renderError(json.error)
        } else {
            sess_hash = json.tableRow.sess_hash;
            model.setSessHash(sess_hash);
            model.lang = json.lang;

            model.langObj = {};

            switch (model.lang.name) {
                case 'ru':
                    model.langObj = ruLang;
                    break;
            }


            if (sess_hash_in === true)
                localStorage.setItem(params_string, sess_hash)
            ReactDom.render(<ThemeProvider theme={theme}>
                <TotumForm data={json} container={div} model={model}/>;
            </ThemeProvider>, div);
        }
        resolve(true);

    }).catch(renderError);
    ReactDom.render(
        <Trobber/>
        , div);
    //console.log(div, post, get, form_address);
    return prms;
};


