"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Define a nested schema for the media objects
const chat_schema = new mongoose_1.Schema({
    idempotency_key: { type: String, required: true },
    appointment_id: { type: String, required: true },
    text: { type: String, },
    media: { type: [], default: [] },
    physician_id: { type: String, required: true },
    patient_id: { type: String, required: true },
    is_patient: { type: Boolean, default: false },
    is_physician: { type: Boolean, default: false },
    date: { type: Number, default: Date.now() },
}, { timestamps: true });
const Chat_Model = (0, mongoose_1.model)("Chat", chat_schema);
exports.default = Chat_Model;
//# sourceMappingURL=chat_model.js.map