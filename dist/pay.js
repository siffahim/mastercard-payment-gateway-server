"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const pay = (amount, session) => __awaiter(void 0, void 0, void 0, function* () {
    const date = new Date();
    const time = date.getTime();
    const transactionID = "TX-" + date.getDate() + date.getMonth() + date.getFullYear() + time;
    const orderID = "ORDER-" + date.getDate() + date.getMonth() + date.getFullYear() + time;
    const price = Number(amount);
    const response = yield axios_1.default.put(`https://eu-gateway.mastercard.com/api/rest/version/81/merchant/${process.env.MERCHANT_ID}/order/${orderID}/transaction/${transactionID}`, {
        apiOperation: "PAY",
        session: {
            id: session,
        },
        order: {
            amount: price,
            currency: "USD",
            reference: orderID,
        },
        transaction: {
            reference: transactionID,
        },
        sourceOfFunds: {
            type: "CARD",
        },
    }, {
        headers: {
            Authorization: `Basic ${Buffer.from(`merchant.${process.env.MERCHANT_ID}:${process.env.MERCHANT_PASS}`).toString("base64")}`,
            "Content-Type": "application/json",
        },
    });
    const data = yield response.data;
    return data;
});
exports.default = pay;
