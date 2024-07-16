import axios from "axios";

const pay = async (amount: string, session: string) => {
  const date = new Date();
  const time = date.getTime();

  const transactionID =
    "TX-" + date.getDate() + date.getMonth() + date.getFullYear() + time;
  const orderID =
    "ORDER-" + date.getDate() + date.getMonth() + date.getFullYear() + time;
  const price = Number(amount);

  const response = await axios.put(
    `https://eu-gateway.mastercard.com/api/rest/version/81/merchant/${process.env.MERCHANT_ID}/order/${orderID}/transaction/${transactionID}`,
    {
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
  return data;
};

export default pay;
