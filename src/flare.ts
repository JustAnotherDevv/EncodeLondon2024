interface Event {
  logIndex: string;
  emitterAddress: string;
  topics: string[];
  data: string;
  removed: boolean;
}

interface RequestBody {
  transactionHash: string;
  requiredConfirmations: string;
  provideInput: boolean;
  listEvents: boolean;
  logIndices: string[];
}

interface ResponseBody {
  blockNumber: string;
  timestamp: string;
  sourceAddress: string;
  isDeployment: boolean;
  receivingAddress: string;
  value: string;
  input: string;
  status: string;
  events: Event[];
}

interface VerifierResponse {
  attestationType: string;
  sourceId: string;
  votingRound: string;
  lowestUsedTimestamp: string;
  requestBody: RequestBody;
  responseBody: ResponseBody;
}

interface ApiResponse {
  status: "VALID" | string;
  response: VerifierResponse;
}

interface PrepareVerificationProps {
  apiKey: string;
  requestBody: RequestBody;
}

const prepareEVMTransactionVerification = async ({
  apiKey,
  requestBody,
}: PrepareVerificationProps): Promise<ApiResponse> => {
  try {
    const response = await fetch(
      "https://evm.verifier.aflabs.net/verifier/eth/EVMTransaction/prepareResponse",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error preparing EVM transaction verification:", error);
    throw error;
  }
};

const useEVMTransactionVerification = (
  apiKey: string,
  transactionHash: string
) => {
  const verifyTransaction = async (apiKey: string, transactionHash: string) => {
    const requestBody: RequestBody = {
      transactionHash,
      requiredConfirmations: "1",
      provideInput: true,
      listEvents: true,
      logIndices: [],
    };

    try {
      const result = await prepareEVMTransactionVerification({
        apiKey,
        requestBody,
      });
      return result;
    } catch (error) {
      throw error;
    }
  };

  return { verifyTransaction };
};

export { prepareEVMTransactionVerification, useEVMTransactionVerification };
export type { ApiResponse, RequestBody, VerifierResponse };
