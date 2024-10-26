const axios = require("axios");

const cairoCode = `use starknet::{
    Store, SyscallResult, StorageBaseAddress, storage_read_syscall, storage_write_syscall,
    storage_address_from_base_and_offset
};
use integer::{
    U128IntoFelt252, Felt252IntoU256, Felt252TryIntoU64, U256TryIntoFelt252, u256_from_felt252
};


#[starknet::contract]
mod test_contract {
    #[storage]
    struct Storage {
        bal:u8
    }
 #[external(v0)]
    fn Fuzz_symbolic_execution(
ref self: ContractState,
    f: felt252,
    u: felt252,
    z: u16,
    z2: u32,
    i: u64,
    n: u128,
    g: u128,
    l: u128,
    a: felt252,
    b: felt252,
    s: u8,
    ) {
        if (f == 'f') {
            if (u == 'u') {
                if (z == 'z') {
                    if (z2 == 'z') {
                        if (i == 'i') {
                            if (n == 'n') {
                                if (g == 'g') {
                                    if (l == 'l') {
                                        if (a == 'a') {
                                            if (b == 'b') {
                                                if (s == 's') {
                                                    assert(1==0 , '!(f & t)');
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return ();
    }
}`;

async function compileCairoCode() {
  try {
    const url = "http://localhost:3000/compile";

    const data = {
      code: cairoCode,
      filename: "test.cairo",
    };

    console.log("Sending compilation request...");

    const response = await axios.post(url, data);

    if (response.data.success) {
      console.log("\n=== Compilation Successful ===\n");

      console.log("=== Sierra Output ===");
      console.log(response.data.sierra);

      console.log("\n=== CASM Output ===");
      console.log(response.data.casm);

      console.log("\n=== Compilation Logs ===");
      console.log(
        "Sierra compilation output:",
        response.data.sierraCompilationOutput
      );
      console.log(
        "CASM compilation output:",
        response.data.casmCompilationOutput
      );
    } else {
      console.error("\n=== Compilation Failed ===");
      console.error("Error:", response.data.error);
      if (response.data.stderr) {
        console.error("Stderr:", response.data.stderr);
      }
    }
  } catch (error) {
    console.error("\n=== Request Failed ===");
    if (error.response) {
      console.error("Server Error:", error.response.data);
      console.error("Status:", error.response.status);
    } else if (error.request) {
      console.error("No response received from server");
    } else {
      console.error("Error:", error.message);
    }
  }
}

async function compileCairoCodeWithFormData() {
  try {
    const FormData = require("form-data");
    const formData = new FormData();

    formData.append("code", cairoCode);
    formData.append("filename", "test.cairo");

    const response = await axios.post(
      "http://localhost:3000/compile-form",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    if (response.data.success) {
      console.log("\n=== Compilation Successful ===\n");
      console.log("Sierra Output:", response.data.sierra);
      console.log("\nCASM Output:", response.data.casm);
    } else {
      console.error("\n=== Compilation Failed ===");
      console.error("Error:", response.data.error);
    }
  } catch (error) {
    console.error("\n=== Request Failed ===");
    console.error("Error:", error.message);
  }
}

console.log("Starting Cairo compilation...");
compileCairoCode()
  .then(() => console.log("\nProcess completed"))
  .catch((error) => console.error("\nProcess failed:", error));

/*
compileCairoCodeWithFormData()
    .then(() => console.log('\nProcess completed'))
    .catch(error => console.error('\nProcess failed:', error));
*/
