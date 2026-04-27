import axios from "axios";
import { Cuentto, FeaturedCuentto } from "@/types/cuentto";
import { CuenttoCreateData } from "../formSchemas/cuentto";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface CuenttoUpdatePayload {
  title: string;
  description: string;
  duration?: number;
  moodId: number;
  musicId?: number;
  isPublic?: boolean;
  isSelfShared?: boolean;
  groupIds?: number[];
}

export const fetchAllCuenttos = async (): Promise<Cuentto[]> => {
  const token = localStorage.getItem("authToken");
  const response = await axios.get(`${API_URL}/api/feed/all`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return response.data.cuenttos;
};

export const fetchFeaturedCuenttos = async (): Promise<FeaturedCuentto[]> => {
  const token = localStorage.getItem("authToken");
  const response = await axios.get(`${API_URL}/api/feed/featured`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return response.data.cuenttos.slice(0, 4);
};

export const createCuentto = async (data: CuenttoCreateData) => {
  const token = localStorage.getItem("authToken");
  const response = await axios.post(`${API_URL}/api/cuentto`, data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return response.data;
};

export const fetchDetailCuentto = async (id: number): Promise<Cuentto> => {
  const token = localStorage.getItem("authToken");
  const response = await axios.get(`${API_URL}/api/cuentto/detail/${id}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  const cuentto = response.data.cuentto as Cuentto;
  return {
    ...cuentto,
    groupIds:
      cuentto.groupIds ?? cuentto.groups?.map((group) => group.id) ?? [],
  };
};

export const deleteCuentto = async (id: number): Promise<void> => {
  const token = localStorage.getItem("authToken");
  await axios.delete(`${API_URL}/api/cuentto/${id}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
};

export const updateCuentto = async (
  id: number,
  data: CuenttoUpdatePayload
) => {
  const token = localStorage.getItem("authToken");
  const response = await axios.put(`${API_URL}/api/cuentto/${id}`, data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return response.data;
};