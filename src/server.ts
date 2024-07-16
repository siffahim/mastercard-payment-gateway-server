import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import pay from "./pay";
const app = express();

dotenv.config();

//cors
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send(
    "<h1 style='text-align:center;font-family:Lucida Console'>I m alive</h1>"
  );
});

//create session
app.post("/api/session", async (req, res) => {
  // const userData = req.body;
  // console.log("userData", userData);
  const response = await axios.post(
    `https://eu-gateway.mastercard.com/api/rest/version/81/merchant/${process.env.MERCHANT_ID}/session`,
    {},
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `merchant.${process.env.MERCHANT_ID}:${process.env.MERCHANT_PASS}`
        ).toString("base64")}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.data;

  res.status(200).json({
    success: true,
    message: "Session created successfully",
    data: data.session.id,
  });
});

//update card and pay
app.post("/api/pay", async (req, res) => {
  const value = req.body.value;
  const response = await axios.put(
    `https://eu-gateway.mastercard.com/api/rest/version/81/merchant/${process.env.MERCHANT_ID}/session/${value.session}`,
    {
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
    },
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `merchant.${process.env.MERCHANT_ID}:${process.env.MERCHANT_PASS}`
        ).toString("base64")}`,
        "Content-Type": "application/json",
      },
    }
  );
  const data = await response.data;

  let result;
  if (data.session.updateStatus) {
    result = await pay(value.price, value.session);
  }

  res.status(200).json({
    success: true,
    message: "Payment completed successfully",
    data: result,
  });
});

app.listen(5000, () => {
  console.log("Application listening on port:5000");
});
