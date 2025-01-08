"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readable_date = readable_date;
function converted_datetime(milliseconds) {
    let current_date_in_millis;
    if (milliseconds) {
        current_date_in_millis = typeof milliseconds === 'string' ? parseFloat(milliseconds) : milliseconds;
    }
    else {
        current_date_in_millis = new Date().getTime();
    }
    return current_date_in_millis;
}
exports.default = converted_datetime;
function readable_date(ms) {
    const date = new Date(ms * 1000);
    // Format the date and time
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    };
    const readable_date = date.toLocaleString('en-US', options);
    return readable_date;
}
//# sourceMappingURL=date_time_elements.js.map