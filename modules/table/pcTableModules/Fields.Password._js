fieldTypes.password = {
    icon: 'fa-lock',
    getEditVal: function(input){
        var val=input.val().trim();
        var error = false;
        if (val === undefined || val === '' || val === null) {
            notify = App.translate('The field %s must be entered', this.title);
            error = true;
        }
        if (error) throw notify;

        return val;
    },
    getCellText: function (val) {
        return '**PASSWORD**';
    },
    getEditElement: function ($oldInput, oldValue, item, enterClbk, escClbk, blurClbk, tabindex) {
        var $input = $('<input type="password" name="cell_edit" class="form-control"  autocomplete="new-password" autocorrect="off" placeholder="'+App.translate(oldValue && oldValue.v?'Change the password':'New password')+'"/>');

        $input.on('save-me', function (event) {
            enterClbk($(this), event);
        });


        if (tabindex) $input.attr('tabindex', tabindex);

        var field = this;
        oldValue=oldValue.v;
        $input.on('keydown', function (event) {
            switch (event.keyCode) {
                case 13:
                case 9:
                    try{
                        $input.data('enterClicked', true);
                        enterClbk($(this), event);
                        return false;
                    }
                    catch (err){
                        $input.data('enterClicked', false);
                        App.popNotify(err, $input, 'default');
                        field.focusElement($input);
                    }
                    break;
                case 27:
                    escClbk($(this), event);
                    return false;
                    break;
            }
        })

        var blur = function(event) {
            blurClbk($input, event);
            return;
        }
        $input.on('blur', function (event) {
            blur(event);
        });
        return $input.select();
    },
};