fieldTypes.checkbox = {
    icon: 'fa-check-square',
    getEditVal: function (input) {
        return input.is(':checked') ? true : false;
    },
    getCellText: function (fieldValue) {
        if (fieldValue === true) return '✓';
        if (fieldValue === false) return '-';
        return '';
    },
    getEditElement: function ($oldInput, oldValue, item, enterClbk, escClbk, blurClbk, tabindex) {
        var $input = $('<input type="checkbox" name="cell_edit"/>');
        this.checkWaiting($input);
        if (tabindex) $input.attr('tabindex', tabindex);
        let action = false;
        $input.on('keydown', function (event) {
            switch (event.key) {
                case 'Enter':
                case  'Tab':
                    action = true;
                    setTimeout(function () {
                        enterClbk($input, event);
                    }, 20);
                    break;
                case ' ':
                    $input.prop('checked', $input.is(':checked') ? '' : 'checked')
                    action = true;
                    enterClbk($input, event);
                    break;
            }
        });
        $input.on('blur', function (event) {
            if (!action) {
                setTimeout(function () {
                    if ($input.length && $input.closest('body').length)
                        escClbk($input, event);
                }, 220);
            }
        });

        var field = this;

        if (oldValue.v === true) {
            $input.prop('checked', true);
        }

        $input.on('click', function (event) {
            action = true;
            enterClbk($input, event, 'enter');
        });
        return $input;
    }

};