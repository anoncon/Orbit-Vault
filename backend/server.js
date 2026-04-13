import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, "../frontend");

const app = express();
const port = process.env.PORT || 3000;

const vaultTemplates = [
  {
    id: "community-solar",
    title: "Community Solar Fund",
    goal: 1800,
    asset: "XLM",
    cadence: "Monthly"
  },
  {
    id: "creator-equipment",
    title: "Creator Equipment Vault",
    goal: 950,
    asset: "USDC",
    cadence: "Weekly"
  }
];

app.use(express.json());

app.get("/api/status", (_request, response) => {
  response.json({
    name: "Orbit Vault API",
    status: "online",
    mode: "prototype",
    network: "Stellar-ready scaffold"
  });
});

app.get("/api/vault-templates", (_request, response) => {
  response.json(vaultTemplates);
});

app.post("/api/intents/create-vault", (request, response) => {
  const { title, goal, asset } = request.body ?? {};

  response.json({
    accepted: true,
    title: title || "Untitled Vault",
    goal: Number(goal || 0),
    asset: asset || "XLM",
    nextStep: "Connect this route to Soroban contract deployment in the next phase."
  });
});

app.use(express.static(frontendDir));

app.get("*", (_request, response) => {
  response.sendFile(path.join(frontendDir, "index.html"));
});

app.listen(port, () => {
  console.log(`Orbit Vault backend running on http://localhost:${port}`);
});
