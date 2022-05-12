$(function () {
    App.notifications = function (BellNotifications) {
        let model = App.models.table('/Table/');
        model.addPcTable({model: model});

        if (!BellNotifications.data('withClick')) {
            BellNotifications.data('withClick', true);
            BellNotifications.on('click', function (event) {
                model.getNotificationsTable();
            });
        }

        let RequestObject = {};
        let activeNotifications = {};
        let periodicity = BellNotifications.data('periodicity') || 0;


        const listenerName = "visibilitychange";

        const check = function () {
            switch (document.visibilityState) {
                case 'hidden':
                    if (RequestObject.jqXHR && RequestObject.jqXHR.abort)
                        RequestObject.jqXHR.abort();
                    RequestObject.aborted = true;
                    break;
                case 'visible':

                    delete RequestObject.aborted;

                    model.checkForNotifications(periodicity, Object.keys(activeNotifications), RequestObject).then(function (json) {
                        if (json.notifications && json.notifications.length) {
                            activeNotifications[json.notification_id] = App.showDatas.call(model, json.notifications, json.notification_id);

                            activeNotifications[json.notification_id].forEach(function (dialog) {
                                if (dialog && dialog.$modal && dialog.$modal.length) {
                                    dialog.$modal.on('hide.bs.modal', function () {
                                        delete activeNotifications[json.notification_id];
                                    });
                                }
                            });
                        }
                        if (json.deactivated && json.deactivated.forEach) {
                            json.deactivated.forEach(function (id) {
                                if (activeNotifications[id]) {
                                    activeNotifications[id].forEach(function (dialog) {
                                        dialog.simpleClose();
                                    });
                                    delete activeNotifications[id];
                                }
                            })
                        }
                        App.checkNotificationManager(activeNotifications)
                        if (periodicity > 0)
                            check()
                    }).fail(function (json) {
                        if (json && json.error) {
                            document.removeEventListener(listenerName, check);
                        }
                    })
            }
        };

        if (periodicity > 0) {
            document.addEventListener(listenerName, check);
            check();
        }
        return check;
    }
    if (App.isTopWindow()) {
        let BellNotifications = $('#bell-notifications');
        if (BellNotifications.length) {

            App.notifications(BellNotifications);
        }
    }
});