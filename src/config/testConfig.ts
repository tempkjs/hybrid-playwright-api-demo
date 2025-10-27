import dotenv from "dotenv";
dotenv.config();

export const config = {
  baseUrlUI: process.env.BASE_URL_UI || "https://demoqa.com",
  baseUrlAPI: process.env.BASE_URL_API || "https://reqres.in/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" }
};
