const axios = require("axios");
const { curry } = require("lodash/fp");

// Configuration object
const config = {
  maxRetries: 3,
  delayBetweenRetries: 1000,
};

// Helper to create JSON-RPC payload
const createJsonRpcPayload = (method, params) => ({
  jsonrpc: "2.0",
  id: 1,
  method,
  params,
});

// Retry mechanism with exponential backoff
const retry = async (fn, retries = config.maxRetries) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          config.delayBetweenRetries * (config.maxRetries - retries + 1)
        )
      );
      return retry(fn, retries - 1);
    }
    throw error;
  }
};

// Curried function to make RPC calls
const makeRpcCall = curry(async (rpcUrl, payload) => {
  try {
    const response = await retry(() =>
      axios.post(rpcUrl, payload, {
        headers: { "Content-Type": "application/json" },
      })
    );
    return response.data.result;
  } catch (error) {
    console.error("RPC call failed:", error.message);
    if (error.response?.data) {
      console.error(
        "RPC error details:",
        JSON.stringify(error.response.data, null, 2)
      );
    }
    throw error;
  }
});

// Get blocks with transactions
const getBlocksWithTransactions = async (rpcCall, startBlock, endBlock) => {
  const payload = createJsonRpcPayload("eth_getLogs", [
    {
      fromBlock: `0x${startBlock.toString(16)}`,
      toBlock: `0x${endBlock.toString(16)}`,
      topics: [],
    },
  ]);

  return rpcCall(payload);
};

// Get transaction trace
const getTransactionTrace = async (rpcCall, txHash) => {
  const payload = createJsonRpcPayload("trace_transaction", [txHash]);
  return rpcCall(payload);
};

// Get transaction receipt
const getTransactionReceipt = async (rpcCall, txHash) => {
  const payload = createJsonRpcPayload("eth_getTransactionReceipt", [txHash]);
  return rpcCall(payload);
};

// Get originating transactions (where address is the sender)
const getOriginatingTransactions = async (rpcCall, address) => {
  const countPayload = createJsonRpcPayload("eth_getTransactionCount", [
    address,
    "latest",
  ]);
  const count = await rpcCall(countPayload);
  const txCount = parseInt(count, 16);

  console.log(`Found ${txCount} originating transactions`);
  return txCount;
};

// Get internal transactions
const getInternalTransactions = async (rpcCall, address) => {
  try {
    // First get the latest block number
    const blockNumberPayload = createJsonRpcPayload("eth_blockNumber", []);
    const latestBlock = parseInt(await rpcCall(blockNumberPayload), 16);
    console.log(`Latest block: ${latestBlock}`);

    // Use trace_block to get all traces
    const batchSize = 100;
    const internalTxs = new Set();

    for (let i = 16856925; i < latestBlock; i += batchSize) {
      const endBlock = Math.min(i + batchSize, latestBlock);
      console.log(`Processing blocks ${i} to ${endBlock}...`);

      const tracePayload = createJsonRpcPayload("trace_filter", [
        {
          fromBlock: `0x${i.toString(16)}`,
          toBlock: `0x${endBlock.toString(16)}`,
          fromAddress: null,
          toAddress: null,
          after: 0,
          count: 10000,
        },
      ]);

      const traces = await rpcCall(tracePayload);

      if (!traces) continue;

      for (const trace of traces) {
        if (!trace.action) continue;

        const { from, to, callType, value, input } = trace.action;
        const traceType = trace.type;

        // Log every trace for debugging
        console.log("Processing trace:", {
          hash: trace.transactionHash,
          type: traceType,
          callType,
          from: from?.toLowerCase(),
          to: to?.toLowerCase(),
          value,
          input: input?.slice(0, 10), // Just log the function signature
        });

        // Check if this is an internal transaction involving our address
        if (
          traceType === "call" &&
          (to?.toLowerCase() === address.toLowerCase() ||
            from?.toLowerCase() === address.toLowerCase()) &&
          from?.toLowerCase() !== to?.toLowerCase() && // Exclude self-calls
          (value !== "0x0" || (input && input !== "0x"))
        ) {
          internalTxs.add(trace.transactionHash);
          console.log("Found internal transaction:", trace.transactionHash);
        }
      }
    }

    const uniqueInternalTxs = Array.from(internalTxs);
    console.log("All internal transaction hashes:", uniqueInternalTxs);
    return uniqueInternalTxs.length;
  } catch (error) {
    console.error("Error in getInternalTransactions:", error);
    if (error.response?.data) {
      console.error(
        "Error details:",
        JSON.stringify(error.response.data, null, 2)
      );
    }
    return 0;
  }
};

// Get incoming transactions (where address is the receiver)
const getIncomingTransactions = async (rpcCall, address) => {
  const payload = createJsonRpcPayload("eth_getLogs", [
    {
      fromBlock: "0xE1C2C7", //"0x0",
      toBlock: "latest",
      address: address,
      topics: [],
    },
  ]);

  try {
    const logs = await rpcCall(payload);
    const incomingTxs = (logs || []).filter(
      (log) => log.address.toLowerCase() === address.toLowerCase()
    );

    console.log(`Found ${incomingTxs.length} incoming transactions`);
    return incomingTxs.length;
  } catch (error) {
    console.error("Error fetching incoming transactions:", error);
    return 0;
  }
};

// Main function to get transaction counts
const getTransactionCounts = async (rpcUrl, address) => {
  const rpcCall = makeRpcCall(rpcUrl);

  try {
    console.log(`Analyzing transactions for address: ${address}`);

    // Get all types of transactions
    const [originatingCount, internalCount, incomingCount] = await Promise.all([
      getOriginatingTransactions(rpcCall, address),
      getInternalTransactions(rpcCall, address),
      getIncomingTransactions(rpcCall, address),
    ]);

    return {
      address,
      originatingTransactions: originatingCount,
      internalTransactions: internalCount,
      incomingTransactions: incomingCount,
      totalTransactions: originatingCount + internalCount + incomingCount,
    };
  } catch (error) {
    console.error("Error analyzing transactions:", error);
    throw error;
  }
};

// Usage example
const main = async () => {
  try {
    const rpcUrl =
      "https://rpc.ankr.com/base_sepolia/d07993f4b10122f8a1bb1919aba3c64ffe0ad8b145fe64326295e1331228632c";
    const address = "0x8101F23DF6F9912F158D0383ad6904c774BEA7E0";

    const results = await getTransactionCounts(rpcUrl, address);
    console.log("Transaction Analysis Results:", results);
  } catch (error) {
    console.error("Error analyzing transactions:", error);
  }
};
main();
module.exports = {
  getTransactionCounts,
  config,
};
