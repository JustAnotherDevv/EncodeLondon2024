const axios = require("axios");
const Either = require("fp-ts/Either");
const TaskEither = require("fp-ts/TaskEither");
const Option = require("fp-ts/Option");
const pipe = require("fp-ts/function").pipe;
const flow = require("fp-ts/function").flow;

const createRpcPayload = (blockHash) => ({
  jsonrpc: "2.0",
  method: "eth_getBlockByHash",
  params: [blockHash, true],
  id: 1,
});

const validateConfig = (config) =>
  pipe(
    Option.of(config),
    Option.chain((c) =>
      c.rpcUrl && c.blockHash ? Option.some(c) : Option.none
    )
  );

const makeRpcRequest = (config) =>
  TaskEither.tryCatch(
    () =>
      axios.post(config.rpcUrl, createRpcPayload(config.blockHash), {
        headers: { "Content-Type": "application/json" },
      }),
    (error) => ({
      type: "RpcError",
      message: error.message,
      original: error,
    })
  );

const extractBlockData = (response) =>
  pipe(
    Either.fromNullable({
      type: "DataError",
      message: "Invalid response data",
    })(response?.data?.result),
    Either.chain((block) =>
      block.hash === null
        ? Either.left({
            type: "BlockError",
            message: "Block not found",
          })
        : Either.right(block)
    )
  );

const fetchBlock = (config) =>
  pipe(
    validateConfig(config),
    Option.fold(
      () =>
        TaskEither.left({
          type: "ConfigError",
          message: "Invalid configuration",
        }),
      flow(
        makeRpcRequest,
        TaskEither.chain((response) =>
          TaskEither.fromEither(extractBlockData(response))
        )
      )
    )
  );

const main = async () => {
  console.log("starting");
  const result = await fetchBlock({
    rpcUrl:
      "https://rpc.ankr.com/base_sepolia/d07993f4b10122f8a1bb1919aba3c64ffe0ad8b145fe64326295e1331228632c",
    blockHash:
      "0xece30a9c28b4f78d2e4df1eb66cb2db0af6731ebad066aaabe4a81737fcd0f98",
  })();

  console.log(result);

  if (result._tag === "Right") {
    const block = result.right;
  } else {
    const error = result.left;
  }
};
main();

module.exports = {
  fetchBlock,
  validateConfig,
  makeRpcRequest,
  extractBlockData,
};
