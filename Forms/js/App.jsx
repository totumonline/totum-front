import TotumModel from "./TotumModel";
import {TotumForm} from "./components/TotumForm";
import {Trobber} from "./components/Trobber";

import {withStyles} from "@material-ui/core/styles";

import {ruLang} from './components/lang/ru.js'
import {zhLang} from './components/lang/zh.js'

const styles = theme => ({
    "@global": {
        // MUI typography elements use REMs, so you can scale the global
        // font size by setting the font-size on the <html> element.
        html: {
            fontSize: 16,
        }
    }
});


let React = require('react');
let ReactDom = require('react-dom');

const TotumFormStyled = withStyles(styles)(TotumForm);


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
    } else {
        model = new TotumModel(form_address);
    }
    const renderError = function (error) {
        console.log(error);
        error = error.replace(/\[\[/g, '').replace(/\]\]/g, '');
        ReactDom.render(<div className="error">{error.toString()}</div>, div);
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
                case 'zh':
                    model.langObj = zhLang;
                    break;
            }


            if (sess_hash_in === true)
                localStorage.setItem(params_string, sess_hash)
            ReactDom.render(<TotumFormStyled data={json} container={div} model={model}/>, div);
        }
    }).catch(renderError);
    ReactDom.render(
        <Trobber/>
        , div);
    console.log(div, post, get, form_address);
};


