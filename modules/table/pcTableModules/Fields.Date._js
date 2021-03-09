fieldTypes.date = {
    icon: 'fa-calendar-o',
    getEditVal: function (input) {
        if (this.required && input.val().trim() == '') throw 'Поле должно быть заполнено';
        if (!input.val().trim()) return '';
        let date = input.data('calendar').data('DateTimePicker').date();

        return this.getDbString(date);
    },
    getEditElement: function ($oldInput, oldValue, item, enterClbk, escClbk, blurClbk, tabindex) {
        var $input = $('<input type="text" name="cell_edit" class="form-control" autocomplete="off" autocorrect="off" />');

        if (tabindex) $input.attr('tabindex', tabindex);

        var field = this;
        let format = this.getFormat();

        $input.data('AppUin', App.getUn());

        oldValue = oldValue.v;


        $input.val(this.getViewString(oldValue));

        let cParent = $('<div>');
        let popoverClass;
        if (this.dateTime && /d/i.test(format)) {
            popoverClass = "date-popover"
        }
        var calendar = $('<div></div>').appendTo(cParent);
        calendar.on('dp.change', function (event) {
            if (event.oldDate === null && field.dateTime && (!$input.val() || $input.val() === '')) {
                let date = event.date;
                let now = moment();
                if (date.format('HH:mm') === now.format('HH:mm')) {
                    date = date.hours(0).minutes(0);
                }
                $input.val(date.format(format));
                setDateTimePickerDate();
            } else {
                $input.val(event.date.format(format));
            }
        });
        let timeoutObject;

        $input.on('keyup', function (event) {
            if (timeoutObject) clearTimeout(timeoutObject);
            if (event.keyCode === 13) {
                setDateTimePickerDate();
                enterClbk($(this), event);
            } else if (event.keyCode === 27) {
                escClbk($(this), event);
            } else if (event.keyCode >= 48) {
                timeoutObject = setTimeout(function () {
                    setDateTimePickerDate();
                }, 2000);
            }
        });
        let popoverId, popover;

        const setDateTimePickerDate = function () {
            "use strict";
            let val = $input.val();

            if (val) {
                val = moment(val, format);

            } else {
                val = "";
            }
            try {
                calendar.data("DateTimePicker").date(val);
            } catch (e) {

            }
        };

        setTimeout(function () {
            let cdiv = $input.closest('td').find('.cdiv');
            if (cdiv.length > 0) {
                let data_popover = cdiv.data('bs.popover');
                if (data_popover) {
                    cParent.append(data_popover.options.content);
                    cdiv.popover('destroy');
                }
                popover = $('#' + App.popNotify({
                    $text: cParent,
                    element: cdiv,
                    container: field.pcTable._container,
                    isParams: true,
                    placement: 'bottom',
                    class: popoverClass,
                }));
                $input.on('focus click', function () {
                    popover.show();
                });

            } else {
                $input.on('focus click', function () {
                    if (!popover) {
                        popoverId = App.popNotify(cParent, $input);
                        popover = $('#' + popoverId);
                    }
                    calendar.data("DateTimePicker").show();
                    popover.show();
                    setDateTimePickerDate();
                });
            }

        }, 20);
        $input.on('blur', function (event) {
            setTimeout(function () {
                if (popover && popover.is(':visible')) {
                    popover.hide();
                    setDateTimePickerDate();
                    blurClbk($input, event);
                }
            }, 200);
        });


        calendar.datetimepicker({
            inline: true,
            format: format,
            useCurrent: false,
            showClose: false,
            locale: 'ru',
            sideBySide: true,
            collapse: false
            // defaultDate: moment().format("YYYY-MM-DD 00:00")
        });

        if (oldValue) {
            try {
                calendar.data("DateTimePicker").date(field.getMoment(oldValue));
            } catch (e) {

            }
        } else {
            $input.val("");
        }

        $input.data('calendar', calendar);
        return $input;
    },

    getCellText: function (fieldValue) {
        if (!fieldValue || fieldValue === null) return '';
        return this.getViewString(fieldValue);
    },
    getViewString: function (val) {
        if (!val) return '';
        if (this.dateTime) {
            return App.dateTimeFormats.covertFromDb(val, this.getFormat());
        } else {
            return App.dateFormats.covertFromDb(val, this.getFormat());
        }
    },
    getDbString: function (val) {
        if (!val) return '';

        if (this.dateTime) {
            return App.dateTimeFormats.covertToDb(val, this.getFormat());
        } else {
            return App.dateFormats.covertToDb(val, this.getFormat());
        }
    },
    getMoment: function (val) {

        if (this.dateTime) {
            return moment(val, App.dateTimeFormats.db)
        } else {
            return moment(val, App.dateFormats.db)
        }
    },
    addDataToFilter: function (filterVals, valObj) {

        let hash;
        let val='Пустое'
        if (valObj.v === null || valObj.v === '') {
            hash = ''.hashCode();
        } else {
            hash = valObj.v.toString().hashCode();
            val = typeof valObj.v === "string" ? this.getCellText(valObj.v) : valObj.v;
        }
        filterVals[hash] = val
    },
    getFormat: function () {
        let format = this.dateFormat;
        if (!format) {
            if (this.dateTime) {
                format = 'd.m.y H:i';
            } else {
                format = 'd.m.y';
            }
        }
        let replaces = {
            'd': 'DD',
            'D': 'ddd',
            'j': 'M',
            'z': 'DDD',
            'W': 'W',
            'F': 'MMMM',
            'm': 'MM',
            'M': 'MMM',
            'n': 'M',
            'y': 'YY',
            'Y': 'YYYY',
            'H': 'HH',
            'i': 'mm',
            's': 'ss',
        };
        let formatNew = '';
        for (let i = 0; i < format.length; i++) {
            let letter = format[i];
            formatNew += replaces[letter] || letter;
        }
        return formatNew;
    }

};



