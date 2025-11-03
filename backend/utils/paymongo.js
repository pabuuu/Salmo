import axios from "axios";

const PAYMONGO_BASE = "https://api.paymongo.com/v1";

// Create a new payment intent
export const createPaymentIntent = async (amount, currency = "PHP") => {
  try {
    const response = await axios.post(
      `${PAYMONGO_BASE}/payment_intents`,
      {
        data: {
          attributes: {
            amount,
            currency,
            payment_method_allowed: ["card"],
            capture_type: "automatic",
          },
        },
      },
      {
        auth: { username: process.env.PAYMONGO_SECRET_KEY, password: "" },
      }
    );
    return response.data;
  } catch (err) {
    console.error("Error creating PayMongo intent:", err.response?.data || err.message);
    throw err;
  }
};

// Optional: create a payment method (for advanced flow)
export const createPaymentMethod = async (card) => {
  try {
    const response = await axios.post(
      `${PAYMONGO_BASE}/payment_methods`,
      {
        data: {
          attributes: {
            type: "card",
            details: card,
          },
        },
      },
      {
        auth: { username: process.env.PAYMONGO_SECRET_KEY, password: "" },
      }
    );
    return response.data;
  } catch (err) {
    console.error("Error creating PayMongo payment method:", err.response?.data || err.message);
    throw err;
  }
};

// Optional: attach a payment method to a payment intent
export const attachPaymentMethodToIntent = async (intentId, paymentMethodId) => {
  try {
    const response = await axios.post(
      `${PAYMONGO_BASE}/payment_intents/${intentId}/attach`,
      {
        data: {
          attributes: {
            payment_method: paymentMethodId,
          },
        },
      },
      {
        auth: { username: process.env.PAYMONGO_SECRET_KEY, password: "" },
      }
    );
    return response.data;
  } catch (err) {
    console.error("Error attaching payment method:", err.response?.data || err.message);
    throw err;
  }
};
