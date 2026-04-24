import axios from "axios";
import { LoginFormData } from "../formSchemas/auth";
import { RegisterFormData } from "../formSchemas/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface LoginResponse {
  token: string;
  isAdmin?: boolean;
}

export const loginUser = async (data: LoginFormData): Promise<LoginResponse> => {
  const response = await axios.post(`${API_URL}/api/auth/login`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return {
    token: response.data.token,
    isAdmin: Boolean(response.data.isAdmin),
  };
};

export const storeToken = (token: string) => {
  localStorage.setItem("authToken", token);
};

export const storeIsAdmin = (isAdmin: boolean) => {
  if (isAdmin) {
    localStorage.setItem("isAdmin", "true");
  } else {
    localStorage.removeItem("isAdmin");
  }
};

export const getIsAdmin = (): boolean => {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem("isAdmin") === "true") return true;
  const token = localStorage.getItem("authToken");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Boolean(payload.isAdmin);
  } catch {
    return false;
  }
};

export const registerUser = async (data: RegisterFormData) => {
  const response = await axios.post(`${API_URL}/api/auth/register`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const forgotPassword = async (data: { email: string }) => {
  const response = await axios.post(`${API_URL}/api/auth/forgot-password`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const verifyOTP = async (data: { email: string; otp: string }) => {
  const response = await axios.post(`${API_URL}/api/auth/verify-otp`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const resetPassword = async (data: {
  email: string;
  otp: string;
  password: string;
}) => {
  const response = await axios.post(`${API_URL}/api/auth/reset-password`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};
