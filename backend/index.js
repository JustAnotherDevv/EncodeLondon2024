const express = require("express");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const multer = require("multer");
const cors = require("cors");
const { prepareEVMTransactionVerification } = require("./flare");

require("dotenv").config();

const app = express();

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://vercel-deployment.com"]
      : ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
  maxAge: 86400,
};

app.use(cors(corsOptions));

app.use(
  express.json({
    limit: "50mb",
  })
);

const upload = multer();

const config = {
  compileDir: process.env.COMPILE_DIR || "./cairo_project",
  fuzzingDir: process.env.FUZZING_DIR || "./fuzzing",
  sierraFileName: "output.json", //"output.sierra"
  casmFileName: "output.casm",
  jsonFileName: "output.json",
  cores: 10,
};

/**
 * Extract function names from trait in Cairo code
 * @param {string} code - Cairo source code
 * @returns {string[]} Array of function names from trait
 */
function extractTraitFunctions(code) {
  try {
    const traitMatch = code.match(
      /#\[starknet::interface\]\s*pub\s+trait\s+\w+\s*<[^>]+>\s*\{([^}]+)\}/s
    );

    if (!traitMatch) {
      console.log("No trait definition found");
      return [];
    }

    const traitBlock = traitMatch[1];
    const functionRegex = /fn\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
    const functions = [];
    let match;

    while ((match = functionRegex.exec(traitBlock)) !== null) {
      functions.push(match[1]);
    }

    return functions;
  } catch (error) {
    console.error("Error extracting trait functions:", error);
    return [];
  }
}

/**
 * Execute command in specific directory
 * @param {string} command - Command to execute
 * @param {string} workingDir - Directory to execute command in
 * @returns {string} Command output
 */
function executeCommand(command, workingDir) {
  try {
    const absolutePath = path.resolve(process.cwd(), workingDir);

    const output = execSync(command, {
      cwd: absolutePath,
      stdio: "pipe",
      encoding: "utf-8",
    });
    return output;
  } catch (error) {
    console.error(
      `Error executing command: ${command} in directory: ${workingDir}`
    );
    throw error;
  }
}
// function executeCommand(command, workingDir) {
//   try {
//     const output = execSync(command, {
//       cwd: workingDir,
//       stdio: "pipe",
//       encoding: "utf-8",
//     });
//     return output;
//   } catch (error) {
//     console.error(
//       `Error executing command: ${command} in directory: ${workingDir}`
//     );
//     throw error;
//   }
// }

/**
 * Run fuzzing for a specific function
 * @param {string} functionName - Name of the function to fuzz
 * @param {string} contractFile - Contract file name
 * @param {string} casmFile - CASM file name
 * @param {number} runTime - Fuzzing runtime in seconds
 * @returns {Object} Fuzzing results
 */
async function runFuzzing(functionName, contractFile, casmFile, runTime) {
  try {
    // const contractPath = path.join(config.compileDir, contractFile);
    // const casmPath = path.join(config.compileDir, casmFile);
    const contractPath = `./cairo/${contractFile}`;
    const casmPath = `./cairo/${casmFile}`;

    const command = `cargo run --release -- --cores ${config.cores} --contract ${contractPath} --casm ${casmPath} --function "${functionName}" --run-time ${runTime}`;

    const output = executeCommand(command, config.fuzzingDir);
    return {
      function: functionName,
      success: true,
      output,
    };
  } catch (error) {
    return {
      function: functionName,
      success: false,
      error: error.message,
      stderr: error.stderr?.toString(),
    };
  }
}

/**
 * Compile Cairo code and run fuzzing
 * @param {string} cairoCode - The Cairo source code to compile
 * @param {string} filename - Input filename
 * @param {number} runTime - Fuzzing runtime in seconds
 * @returns {Object} Compilation and fuzzing results
 */
async function compileCairoProjectAndFuzz(cairoCode, filename, runTime) {
  try {
    [config.compileDir, config.fuzzingDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    const inputPath = path.join(config.compileDir, filename);
    const sierraPath = path.join(config.compileDir, config.sierraFileName);
    const casmPath = path.join(config.compileDir, config.casmFileName);
    const jsonPath = path.join(config.compileDir, config.jsonFileName);

    const functions = extractTraitFunctions(cairoCode);
    console.log("Detected trait functions:", functions);

    fs.writeFileSync(inputPath, cairoCode);
    console.log("Created input file:", inputPath);

    console.log(`Compiling Cairo to Sierra in ${sierraPath}...`);
    const sierraOutput = executeCommand(
      //   `cargo run --bin starknet-compile -- --single-file ./${filename} ./${config.sierraFileName}`,
      `cargo run --bin starknet-compile -- --single-file ./${filename} ./${config.sierraFileName}`,
      config.compileDir
    );

    console.log("Compiling Sierra to CASM...");
    const casmOutput = executeCommand(
      `cargo run --bin starknet-sierra-compile -- ./${config.sierraFileName} ./${config.casmFileName}`,
      config.compileDir
    );

    console.log("Starting fuzzing process...");
    const fuzzingResults = [];
    for (const functionName of functions) {
      console.log(`Fuzzing function: ${functionName}`);
      const result = await runFuzzing(
        functionName,
        config.jsonFileName,
        config.casmFileName,
        runTime
      );
      fuzzingResults.push(result);
    }

    const sierraContent = fs.readFileSync(sierraPath, "utf-8");
    const casmContent = fs.readFileSync(casmPath, "utf-8");

    // Clean up files
    // fs.unlinkSync(inputPath);
    // fs.unlinkSync(sierraPath);
    // fs.unlinkSync(casmPath);
    // if (fs.existsSync(jsonPath)) {
    //   fs.unlinkSync(jsonPath);
    // }

    return {
      success: true,
      compilation: {
        sierra: sierraContent,
        casm: casmContent,
        sierraOutput,
        casmOutput,
      },
      functions: functions,
      fuzzingResults: fuzzingResults,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stderr: error.stderr?.toString(),
    };
  }
}

app.post("/compile", async (req, res) => {
  try {
    const { code, filename, runTime } = req.body;

    if (!code || !filename || !runTime) {
      return res.status(400).json({
        success: false,
        error: "Code, filename, and runTime are required",
      });
    }

    if (!filename.endsWith(".cairo")) {
      return res.status(400).json({
        success: false,
        error: "Filename must have .cairo extension",
      });
    }

    if (typeof runTime !== "number" || runTime <= 0) {
      return res.status(400).json({
        success: false,
        error: "runTime must be a positive number",
      });
    }

    const result = await compileCairoProjectAndFuzz(code, filename, runTime);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post("/verify-transaction", async (req, res) => {
  try {
    // console.log(req.body);
    // const { validateApiKey, validateRequestBody } = req.body;
    const apiKey = process.env.FLARE_API_KEY; //req.headers["x-api-key"];
    const {
      transactionHash,
      requiredConfirmations = "1",
      provideInput = true,
      listEvents = true,
      logIndices = [],
    } = req.body;

    const requestBody = {
      transactionHash,
      requiredConfirmations,
      provideInput,
      listEvents,
      logIndices,
    };

    const verificationBody = {
      attestationType:
        "0x45564d5472616e73616374696f6e000000000000000000000000000000000000",
      // "0x45564d5472616e73616374696f6e000000000000000000000000000000000000",
      sourceId:
        "0x7465737445544800000000000000000000000000000000000000000000000000",
      // "0x14a3400000000000000000000000000000000000000000000000000000000000",
      requestBody: requestBody,
    };

    console.log(`verifBody `, verificationBody);

    const verificationResult = await prepareEVMTransactionVerification({
      apiKey,
      //   requestBody,
      verificationBody,
      baseURL: process.env.VERIFIER_BASE_URL,
    });

    res.json(verificationResult);
  } catch (error) {
    console.error("Verification request failed:", error);

    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.data || "Verification service error",
      });
    } else if (error.request) {
      res.status(503).json({
        error: "Verification service unavailable",
      });
    } else {
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    compileDir: config.compileDir,
    fuzzingDir: config.fuzzingDir,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Compile directory: ${config.compileDir}`);
  console.log(`Fuzzing directory: ${config.fuzzingDir}`);
});
