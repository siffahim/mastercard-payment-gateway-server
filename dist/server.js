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
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const pay_1 = __importDefault(require("./pay"));
const app = (0, express_1.default)();
dotenv_1.default.config();
//cors
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.send("<h1 style='text-align:center;font-family:Lucida Console'>I m alive</h1>");
});
//create session
app.post("/api/session", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const userData = req.body;
    // console.log("userData", userData);
    const response = yield axios_1.default.post(`https://eu-gateway.mastercard.com/api/rest/version/81/merchant/${process.env.MERCHANT_ID}/session`, {}, {
        headers: {
            Authorization: `Basic ${Buffer.from(`merchant.${process.env.MERCHANT_ID}:${process.env.MERCHANT_PASS}`).toString("base64")}`,
            "Content-Type": "application/json",
        },
    });
    const data = yield response.data;
    res.status(200).json({
        success: true,
        message: "Session created successfully",
        data: data.session.id,
    });
}));
//update card and pay
app.post("/api/pay", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const value = req.body.value;
    const response = yield axios_1.default.put(`https://eu-gateway.mastercard.com/api/rest/version/81/merchant/${process.env.MERCHANT_ID}/session/${value.session}`, {
        sourceOfFunds: {
            type: "CARD",
            provided: {
                card: {
                    number: value.cardNumber,
                    expiry: {
                        month: value.expiryMonth,
                        year: value.expiryYear,
                    },
                    securityCode: value.securityCode,
                },
            },
        },
    }, {
        headers: {
            Authorization: `Basic ${Buffer.from(`merchant.${process.env.MERCHANT_ID}:${process.env.MERCHANT_PASS}`).toString("base64")}`,
            "Content-Type": "application/json",
        },
    });
    const data = yield response.data;
    let result;
    if (data.session.updateStatus) {
        result = yield (0, pay_1.default)(value.price, value.session);
    }
    res.status(200).json({
        success: true,
        message: "Payment completed successfully",
        data: result,
    });
}));
app.listen(5000, () => {
    console.log("Application listening on port:5000");
});
