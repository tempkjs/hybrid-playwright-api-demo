

export const config = {
  baseUrlUI: process.env.BASE_URL_UI || "https://demoqa.com",
  baseUrlAPI: process.env.BASE_URL_API || "https://reqres.in/api",
  USER_EMAIL: "kjplhyb",
  USER_PASSWORD: "Admin@123",
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.REQRES_API_KEY ?? 'reqres-free-v1'
  }
};
