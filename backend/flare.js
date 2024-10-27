const axios = require("axios");

const prepareEVMTransactionVerification = async ({
  apiKey,
  // requestBody,
  verificationBody,
  baseURL = "https://evm.verifier.aflabs.net",
}) => {
  try {
    console.log(verificationBody);
    const response = await axios({
      method: "POST",
      url: `${baseURL}/verifier/eth/EVMTransaction/prepareResponse`,
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
        Accept: "application/json",
      },
      data: JSON.stringify(verificationBody),
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error in EVM transaction verification:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = { prepareEVMTransactionVerification };
