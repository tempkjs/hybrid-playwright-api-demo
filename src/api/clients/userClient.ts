import axios from "axios";
import { config } from "../../config/testConfig";

const api = axios.create({
  baseURL: config.baseUrlAPI,
  timeout: config.timeout,
  headers: config.headers
});

export const UserClient = {
  async getUser(id: string) { return api.get(`/users/${id}`); },
  async createUser(data: any) { return api.post(`/users`, data); }
};
