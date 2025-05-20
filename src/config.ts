import * as dotenv from "dotenv";

dotenv.config();

export default function getConfig() {
  return {
    backendBaseUrl: process.env["BACKEND_BASE_URL"] ?? "http://localhost:3000"
  };
}
