$(function () {

    if (App.isTopWindow()) {
        let BellNotifications = $('#bell-notifications');
        if (BellNotifications.length) {
            let model = App.models.table('/Main/');
            model.addPcTable({model: model});

            BellNotifications.on('click', function () {
                model.getNotificationsTable();
            });

            let RequestObject = {};
            let activeNotifications = {};
            let periodicity = BellNotifications.data('periodicity') || 0;

            if (periodicity > 0) {
                const check = function () {
                    switch (document.visibilityState) {
                        case 'hidden':
                            if (RequestObject.jqXHR && RequestObject.jqXHR.abort)
                                RequestObject.jqXHR.abort();
                            RequestObject = {};
                            break;
                        case 'visible':

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
                                check()
                            }).fail(function (json) {
                                if (json && json.error) {
                                    document.removeEventListener("visibilitychange", check);
                                }
                            })
                    }
                };
                document.addEventListener("visibilitychange", check);
                check();
            }
        }
    }
});