const express = require("express");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const multer = require("multer");

const app = express();
app.use(
  express.json({
    limit: "50mb",
  })
);

const upload = multer();

const config = {
  workingDir: "../../../Development/personal/encodelondon/cairo-fuzzer/cairo",
  sierraFileName: "output.sierra",
  casmFileName: "output.casm",
};

/**
 * Execute command in working directory
 * @param {string} command - Command to execute
 * @returns {string} Command output
 */
function executeCommand(command) {
  try {
    const output = execSync(command, {
      cwd: config.workingDir,
      stdio: "pipe",
      encoding: "utf-8",
    });
    return output;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    throw error;
  }
}

/**
 * Compile Cairo code
 * @param {string} cairoCode - The Cairo source code to compile
 * @param {string} filename - Input filename
 * @returns {Object} Compilation results
 */
async function compileCairoProject(cairoCode, filename) {
  try {
    if (!fs.existsSync(config.workingDir)) {
      fs.mkdirSync(config.workingDir, { recursive: true });
    }

    const inputPath = path.join(config.workingDir, filename);
    const sierraPath = path.join(config.workingDir, config.sierraFileName);
    const casmPath = path.join(config.workingDir, config.casmFileName);

    fs.writeFileSync(inputPath, cairoCode);

    const sierraOutput = executeCommand(
      `cargo run --bin starknet-compile -- --single-file ./${filename} ./${config.sierraFileName}`
    );

    const casmOutput = executeCommand(
      `cargo run --bin starknet-sierra-compile -- ./${config.sierraFileName} ./${config.casmFileName}`
    );

    const sierraContent = fs.readFileSync(sierraPath, "utf-8");
    const casmContent = fs.readFileSync(casmPath, "utf-8");

    fs.unlinkSync(inputPath);
    fs.unlinkSync(sierraPath);
    fs.unlinkSync(casmPath);

    return {
      success: true,
      sierra: sierraContent,
      casm: casmContent,
      sierraCompilationOutput: sierraOutput,
      casmCompilationOutput: casmOutput,
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
    const { code, filename } = req.body;

    if (!code || !filename) {
      return res.status(400).json({
        success: false,
        error: "Both code and filename are required",
      });
    }

    if (!filename.endsWith(".cairo")) {
      return res.status(400).json({
        success: false,
        error: "Filename must have .cairo extension",
      });
    }

    const result = await compileCairoProject(code, filename);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post("/compile-form", upload.none(), async (req, res) => {
  try {
    const { code, filename } = req.body;

    if (!code || !filename) {
      return res.status(400).json({
        success: false,
        error: "Both code and filename are required",
      });
    }

    if (!filename.endsWith(".cairo")) {
      return res.status(400).json({
        success: false,
        error: "Filename must have .cairo extension",
      });
    }

    const result = await compileCairoProject(code, filename);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
