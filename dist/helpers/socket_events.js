"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.physician_socket_messanger = exports.patient_socket_messanger = void 0;
const index_1 = require("../index");
const patient_socket_messanger = (title, data, sending_data) => {
    index_1.io.emit(`${title}-${data.patient_id}`, {
        statusCode: 200,
        notificationData: sending_data,
    });
};
exports.patient_socket_messanger = patient_socket_messanger;
const physician_socket_messanger = (title, data, sending_data) => {
    index_1.io.emit(`${title}-${data.physician_id}`, {
        statusCode: 200,
        notificationData: sending_data,
    });
};
exports.physician_socket_messanger = physician_socket_messanger;
//# sourceMappingURL=socket_events.js.map