import axios from "axios";
import { LoginFormData } from "../formSchemas/auth";
import { RegisterFormData } from "../formSchemas/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const loginUser = async (data: LoginFormData): Promise<string> => {
  const response = await axios.post(`${API_URL}/api/auth/login`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data.token;
};

export const storeToken = (token: string) => {
  localStorage.setItem("authToken", token);
};

export const registerUser = async (data: RegisterFormData) => {
  const response = await axios.post(`${API_URL}/api/auth/register`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};
