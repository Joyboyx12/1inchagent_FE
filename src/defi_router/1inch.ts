import axios, { AxiosRequestConfig } from "axios";
import { ethers } from "ethers";

interface SwapParams {
  chain: string;
  from_token_address: string;
  to_token_address: string;
  amount: string;
  from: string;
  origin: string;
  slippage: string;
}

export async function oneinch_swap(params: SwapParams) {

  const url = `${process.env.NEXT_PUBLIC_HOST}/oneinch_swap`;

  const config: AxiosRequestConfig = {
    headers: {
      Authorization: "Bearer orirL4sDsWDboQMCOjQmrx7L4fsmbco6",
    },
    params: {
      chain: params.chain,
      src: params.from_token_address,
      dst: params.to_token_address,
      amount: params.amount,
      from: params.from,
      origin: params.origin,
      slippage: params.slippage,
      disableEstimate: true
    },
  };
  // Generate and log the full request URL
  const requestUrl = `${url}?${new URLSearchParams(config.params as any).toString()}`;
  console.log("Full Request URL:", requestUrl);

  try {
    const response = await axios.get(url, config);

    // Log the response data for debugging
    console.log("API Response:", response.data);

    return response.data;
  } catch (error: any) {
    console.error("Error Message:", error.message);

    if (error.response) {
      console.error("Response Data:", error.response.data);
      console.error("Response Status:", error.response.status);
    } else if (error.request) {
      console.error("No Response Received:", error.request);
    } else {
      console.error("Unexpected Error:", error.message);
    }

    throw error;
  }
}

export async function getapprove(chain: string, tokenAddress: string, amount:string) {

  const url = `${process.env.NEXT_PUBLIC_HOST}/getapprove`;

  const config: AxiosRequestConfig = {
    headers: {
      Authorization: "Bearer orirL4sDsWDboQMCOjQmrx7L4fsmbco6",
    },
    params: {
      chain: chain,
      tokenAddress: tokenAddress,
      //amount: amount,
    },
  };
  // Generate and log the full request URL
  const requestUrl = `${url}?${new URLSearchParams(config.params as any).toString()}`;
  console.log("Full Request URL:", requestUrl);

  try {
    const response = await axios.get(url, config);

    // Log the response data for debugging
    console.log("API Response:", response.data);

    return response.data;
  } catch (error: any) {
    console.error("Error Message:", error.message);

    if (error.response) {
      console.error("Response Data:", error.response.data);
      console.error("Response Status:", error.response.status);
    } else if (error.request) {
      console.error("No Response Received:", error.request);
    } else {
      console.error("Unexpected Error:", error.message);
    }

    throw error;
  }
}

export async function checkallowance(chain: string, tokenAddress: string, walletAddress:string) {

  const url = `${process.env.NEXT_PUBLIC_HOST}/checkallowance`;

  const config: AxiosRequestConfig = {
    headers: {
      Authorization: "Bearer orirL4sDsWDboQMCOjQmrx7L4fsmbco6",
    },
    params: {
      chain: chain,
      tokenAddress: tokenAddress,
      walletAddress: walletAddress,
    },
  };
  // Generate and log the full request URL
  const requestUrl = `${url}?${new URLSearchParams(config.params as any).toString()}`;
  console.log("Full Request URL:", requestUrl);

  try {
    const response = await axios.get(url, config);

    // Log the response data for debugging
    console.log("API Response:", response.data);

    return response.data;
  } catch (error: any) {
    console.error("Error Message:", error.message);

    if (error.response) {
      console.error("Response Data:", error.response.data);
      console.error("Response Status:", error.response.status);
    } else if (error.request) {
      console.error("No Response Received:", error.request);
    } else {
      console.error("Unexpected Error:", error.message);
    }

    throw error;
  }
}



export async function get_swaprice(chain: string, src: string, dst: string, amount: string) {
  // Localhost API URL
  const baseURL = `${process.env.NEXT_PUBLIC_HOST}/get_swaprice`;

  const config = {
    params: {
      chain: chain, // Chuỗi (vd: eth)
      src: src, // Địa chỉ của token nguồn
      dst: dst, // Địa chỉ của token đích
      amount: convertToWei(amount,18), // Số lượng swap (trong Wei)
    },
  };
  try {
    // Gọi API localhost
    const response = await axios.get(baseURL, config);
    
    // Trả về dữ liệu nhận được từ localhost API
    return response.data;
  } catch (error) {
    console.error("Error calling localhost API:", error);
    throw error;
  }
}

// Hàm chuyển đổi số lượng token sang định dạng Wei
export function convertToWei(amount: string, decimals: number): string {
  // Sử dụng ethers.js để chuyển đổi số lượng token sang Wei
  const weiAmount = ethers.utils.parseUnits(amount, decimals);
  return weiAmount.toString(); // Trả về giá trị Wei dưới dạng chuỗi
}