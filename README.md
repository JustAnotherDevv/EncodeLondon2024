# Encode London 2024 Project

ToDo

# Abstract

## Deployment

**Base Sepolia**

- `MockERC20` - ``
- `MockVault` - ``
- `VulnerableVault` - ``

# Features

## For Developers - Security Scanner

```mermaid
graph TD
subgraph Frontend[Web Application]
A[File Input] -->|Create/Edit| B[Code Editor]
C[GitHub Import] -->|Fetch| B
B -->|Submit| D[API Gateway]
end

    subgraph Backend[Backend Services]
        D -->|Save File| E[File Storage]
        E -->|Generate| F[Sierra Compiler]
        F -->|Compile| G[CASM Generator]
        G -->|Analyze| H[Cairo Fuzzer]
        H -->|Results| I[Security Analysis]

        subgraph AI_Analysis[AI Analysis Pipeline]
            I -->|Send Code| J[LLM API]
            J -->|Get Analysis| K[Vulnerability Report]
        end
    end

    subgraph Output[Results]
        I -->|Security Issues| L[Consolidated Report]
        K -->|AI Insights| L
        L -->|Display| M[Web Dashboard]
    end

    style Frontend fill:#e1f5fe,stroke:#01579b
    style Backend fill:#f3e5f5,stroke:#4a148c
    style Output fill:#e8f5e9,stroke:#1b5e20
    style AI_Analysis fill:#fff3e0,stroke:#e65100
```

## For Users - Insurance

ToDo

# Bounties

# Setup

## Project Setup

### Backend

- git clone and build cairo locally

- git clone and build cairo-fuzzer

- fill out env variables with `COMPILE_DIR` as relative path based on backend directory and `FUZZING_DIR` as relative path based on compile directory

- install dependencies with `npm i`

### Frontend

- fill out `.env` based on the `.env.example` //todo

- execute `npm i` to install local dependencies

- execute `npm run dev` to start frontend web app

- execute `npm run api` to start backend //todo

### Smart Contracts

- install all tools required for Starket and Cairo to work - those can be found in Cairo book

- install all required tools to work with EVM networks - Foundry, VS code extensions etc

- execute `forge install OpenZeppelin/openzeppelin-contracts --no-commit` inside `contracts/foundry_evm` directory

- run evm tests using `forge test -vv`

- deploy evm contract to Base Sepolia or your chosen network
