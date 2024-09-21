"use client";

import React, { useEffect, useState } from "react";
import { Button, Tooltip, ScrollShadow, Image } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useAccount, useWallets, } from "@particle-network/connectkit";
import { Event, ethers } from "ethers";
import Web3 from "web3";
import PromptInput from "./prompt-input";
import { cn } from "@/libs/cn";

import { oneinch_swap, get_swaprice , getapprove,checkallowance} from "../defi_router/1inch";
import { MESS_TYPE, useQuestionContext } from "@/context/QuestionContext";
import Upload from "rc-upload";
import { PinataSDK } from "pinata";

import { RcFile } from "rc-upload/lib/interface";
import {FusionSDK, NetworkEnum} from '@1inch/fusion-sdk'


interface OpenAIResponse {
  type: string;
  status: string;
  token?: string;
  amount?: number;
  chain?: string;
  from_token_address?: string;
  to_token_address?: string;
  slippage?: string;
  fromAddress?: string; // Optional because other types might not have these fields
  toAddress?: string;
  fromChainName?: string;
  toChainName?: string;
  message: string;

  name?:string;
  symbol?:string;
  totalSupply?:string;
}

export default function PromptInputWithBottomActions() {
  const { chainId, address } = useAccount();
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const { addMessage } = useQuestionContext();
  const [primaryWallet] = useWallets();
  let actionList: OpenAIResponse[] = [];

  const [url, setUrl] = useState("");

  const props = {
    multiple: true,
    action: async (file: RcFile): Promise<string> => {
      const pinata = new PinataSDK({
        pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT!,
        pinataGateway: "https://brown-academic-porpoise-799.mypinata.cloud",
      });
      const upload = await pinata.upload.file(file);
      setUrl(upload.cid);
      return "";
    },
  };

  useEffect(() => {
    const setupProvider = async () => {
      if (primaryWallet) {
        try {
          const EOAprovider =
            (await primaryWallet.connector.getProvider()) as any;
          const customProvider = new ethers.providers.Web3Provider(
            EOAprovider,
            "any"
          );
          setProvider(customProvider);
        } catch (error) {
          const response_error = await errorhandler(String(error)); // Gọi function errorhandler
          // addAnswer(response_error);
          console.error("Error setting up provider:", error);
        }
      }
    };

    setupProvider();
    
  }, [primaryWallet]);

  
const testfusion = async() => {
  console.log("run")
 await main()

}
  
async function main() {
  const sdk = new FusionSDK({
      url: 'https://api.1inch.dev/fusion',
      network: NetworkEnum.ETHEREUM,
      authKey: 'Bearer orirL4sDsWDboQMCOjQmrx7L4fsmbco6'
  })

  const orders = await sdk.getActiveOrders({page: 1, limit: 2})
}
  const sendETH = async (to: string, token: string, amount: string) => {
    if (!provider || !address) {
      console.error("Provider or address is not available");
      return;
    }

    try {
      const balance = await provider.getBalance(address);
      console.log(`Balance: ${ethers.utils.formatEther(balance)} ETH`);

      const signer = provider.getSigner();

      // Convert the amount to a BigNumber in Wei
      const valueInWei = ethers.BigNumber.from(amount); // Assuming the amount is already in Wei

      const tx = {
        to,
        value: valueInWei, // Ensure the value is a BigNumber
      };
      const txResponse = await signer.sendTransaction(tx);
      console.log("Transaction Response:", txResponse);
      return txResponse;
    } catch (error) {
      const response_error = await errorhandler(String(error)); // Gọi function errorhandler
      addMessage({
        type: MESS_TYPE.BOT,
        content: response_error,
      });
      console.error("Transaction failed:", error);
    }
  };

  const sendTransaction = async (to: string, data: string, value: string) => {
    if (!provider || !address) {
      console.error("Provider or address is not available");
      return;
    }

    try {
      const balance = await provider.getBalance(address);
      console.log(`Balance: ${ethers.utils.formatEther(balance)} ETH`);

      const signer = provider.getSigner();

      // Chuyển đổi value sang BigNumber nếu chưa chuyển đổi
      const valueInWei = ethers.utils.parseUnits(value, "wei"); // Chuyển đổi từ số chuỗi sang BigNumber

      // Tạo đối tượng giao dịch với gas ước lượng
      const tx = {
        from: address,
        to: to, // Địa chỉ người nhận
        data: data, // Dữ liệu giao dịch
        value: valueInWei, // Giá trị giao dịch được chuyển đổi sang Wei
        gasLimit: ethers.BigNumber.from("200000"), // Tăng gas limit
      };

      // Gửi giao dịch
      const txResponse = await signer.sendTransaction(tx);
      console.log("Transaction Response:", txResponse);
      addMessage({
        type: MESS_TYPE.BOT,
        content: "Success! Your Transaction Tx: " + txResponse.hash,
      });
      // Đợi cho giao dịch được khai thác
      const receipt = await txResponse.wait();

      return txResponse;
    } catch (error) {
      const response_error = await errorhandler(String(error)); // Gọi function errorhandler
      addMessage({
        type: MESS_TYPE.BOT,
        content: response_error,
      });
      console.error("Transaction failed:", error);
    }
  };

  const executeSwap = async (
    chain: string,
    src: string,
    dst: string,
    amount: string,
    slippage: string
  ) => {
    try {
      // Chuyển đổi giá trị amount sang Wei
    var valueInWei
    if (src == "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"){
        valueInWei = ethers.utils.parseEther(amount);
    }
    else {
        valueInWei = ethers.utils.parseUnits(amount, 6);
        const allowance = await checkallowance(chain,src,String(address));
        console.log(allowance)
       if (allowance.allowance === "0"){
             // approve
             await delay(2000);
             const approve = await getapprove(chain, src, String(valueInWei) )
             console.log ("Aprrove: " + approve);
             await sendTransaction(
               String(approve.to),
               String(approve.data),
               String(approve.value)
             );
       }

       await delay(2000);
    }

      // Gọi API oneinch_swap để thực hiện hoán đổi token
      const swapResult = await oneinch_swap({
        chain: chain,
        from_token_address: src,
        to_token_address: dst,
        amount: String(valueInWei),
        from: String(address),
        origin: String(address),
        slippage: slippage,
      });


  
      console.log("Swap Result:", swapResult);
      console.log(JSON.stringify(swapResult.tx.to));
  
      // Lấy tên của src và dst từ địa chỉ
      const srcTokenName = getTokenNameByAddress(chain, src);
      const dstTokenName = getTokenNameByAddress(chain, dst);
  
      // Thêm thông báo về việc hoán đổi
      addMessage({
        type: MESS_TYPE.BOT,
        content: `PROCESSING: SWAP: ${amount} ${srcTokenName} to ${dstTokenName}`,
      });
  
      // Gửi giao dịch lên mạng blockchain
      await sendTransaction(
        String(swapResult.tx.to),
        String(swapResult.tx.data),
        String(swapResult.tx.value)
      );
      
  
    } catch (error) {
      // Xử lý lỗi bằng cách gọi hàm errorhandler
      const response_error = await errorhandler(String(error));
      addMessage({
        type: MESS_TYPE.BOT,
        content: response_error,
      });
      console.error("Error in executeSwap:", error);
    }

 
  };
  
  

  const dataLibraries = {
    "1": {
      name: "Ethereum",
      addresses:
        "ETH: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, DAI: 0x6b175474e89094c44da98b954eedeac495271d0f, USDT: 0xdac17f958d2ee523a2206206994597c13d831ec7, USDC: 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48, BNB: 0xB8c77482e45F1F44dE1745F52C74426C631bDD52, WETH: 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2, BTC: 0x2260fac5e5542a773aa44fbcfedf7c193bc2c599, WBTC: 0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
    },
    "137": {
      name: "Polygon",
      addresses:
        "Matic: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, WETH: 0x7ceb23fd6bc0add59e62ac25578270cff1b9f619, USDT: 0xc2132d05d31c914a87c6611c10748aeb04b58e8f, BNB: 0x3BA4c387f786bFEE076A58914F5Bd38d668B42c3, USDC: 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"
    },
    "10": {
      name: "Optimism",
      addresses:
        "ETH: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, USDT: 0x94b008aa00579c1307b0ef2c499ad98a8ce58e58, USDC: 0x0b2c639c533813f4aa9d7837caf62653d097ff85, BTC: 0x68f180fcce6836688e9084f035309e29bf0a2095, WBTC: 0x68f180fcce6836688e9084f035309e29bf0a2095, WETH: 0x4200000000000000000000000000000000000006, OP: 0x4200000000000000000000000000000000000042, DAI: 0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"
    }
  };

  const getTokenNameByAddress = (chainId: string, address: string): string => {
    // Kiểm tra xem chainId có tồn tại trong dataLibraries hay không
    if (chainId in dataLibraries) {
      const chain = dataLibraries[chainId as keyof typeof dataLibraries];
  
      if (chain) {
        const tokens = chain.addresses.split(", ");
        for (let token of tokens) {
          const [name, tokenAddress] = token.split(": ");
          if (tokenAddress.toLowerCase() === address.toLowerCase()) {
            return name;
          }
        }
      }
    }
    
    return address; // Trả về địa chỉ nếu không tìm thấy token hoặc chain không hợp lệ
  };
  
  


  const processActionList = async () => {
    for (let i = 0; i < actionList.length; i++) {
      const action = actionList[i];
      console.log("Processing action:", action);

      switch (action.type) {
        
        case "Price":
            if (
              action.chain &&
              action.from_token_address &&
              action.to_token_address &&
              action.amount
            ) {
        
            await swap_info (action.chain,action.from_token_address, action.to_token_address, String(action.amount))
          } else {
            console.error("Missing required fields for Price operation.");
          }
          break;
        case "Send":
          if (action.toAddress && action.token && action.amount) {
            addMessage({
              type: MESS_TYPE.BOT,
              content:
                "Sending " +
                String(action.amount) +
                " ETH to " +
                action.toAddress,
            });

            await sendETH(
              action.toAddress,
              action.token,
              String(action.amount)
            );
          } else {
            console.error("Missing required fields for Send operation.");
          }
          break;
        case "Swap":
          if (
            action.chain &&
            action.from_token_address &&
            action.to_token_address &&
            action.amount &&
            action.slippage
          ) {
            
            await executeSwap(
              action.chain,
              action.from_token_address,
              action.to_token_address,
              String(action.amount),
              action.slippage
            );
            
          } else {
            console.error("Missing required fields for Swap operation.");
          }
          break;
        default:
          console.log("Unknown action type:", action.type);
      }
    }

    // Clear the action list after processing
    actionList = [];
    console.log("All actions processed and list cleared.");
  };
  const delay = (ms:number) => new Promise(res => setTimeout(res, ms));
  const handleSendMessage = async () => {
    const fixprompt = {
      chain: chainId,
      prompt: prompt,
      owner_address: address,
    };
    addMessage({
      type: MESS_TYPE.USER,
      content: prompt,
    });

    try {
      // Gửi yêu cầu POST đến backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/sendPrompt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fixprompt),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Nhận phản hồi từ backend
      const openAIResponse = await response.json();

      console.log("OpenAI Response:", openAIResponse);

      //addAnswer(openAIResponse.message);

      // Thay vì thực hiện ngay lập tức, thêm hành động vào danh sách
      actionList.push(openAIResponse);

      console.log("Action added to list:", openAIResponse);
      processActionList();
    } catch (error) {
      console.error(
        "Error sending prompt to OpenAI or processing response:",
        error
      );
      alert(
        "An error occurred while processing your request. Please try again."
      );
    }
  };
  const swap_info =  async (chain: string, from_token_address: string, to_token_address: string, amount: string) => {
    const infomation = await get_swaprice(chain, from_token_address, to_token_address, amount);
    const srcTokenName = getTokenNameByAddress(chain, from_token_address);
    const dstTokenName = getTokenNameByAddress(chain, to_token_address);
    console.log ("Số tiền chưa đổi : " + infomation.dstAmount)
    var formattedDstAmount = ethers.utils.formatUnits(infomation.dstAmount, 18)
    if (from_token_address == "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"){
      formattedDstAmount = ethers.utils.formatUnits(infomation.dstAmount, 6)
    }

    // Chuyển đổi dstAmount từ Wei sang số lượng token phù hợp (USDT có 6 chữ số thập phân)
   
    // Thêm thông điệp vào giao diện
    addMessage({
      type: MESS_TYPE.BOT,
      content: `GET PRICE: ${String(amount)} ${srcTokenName} = ${formattedDstAmount} ${dstTokenName}\n `,
    });
  }
  const errorhandler = async (message: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/error`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Đặt header cho JSON
        },
        body: JSON.stringify({ error: message }), // Chuyển đổi thông điệp thành JSON
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text(); // Hoặc .json() nếu server trả về JSON
      return result;
    } catch (error) {
      console.error("Error sending error to server:", error);
      throw error;
    }
  };




  return (
    <div className="flex w-full flex-col gap-4">
      <ScrollShadow
        hideScrollBar
        className="flex flex-nowrap gap-2"
        orientation="horizontal"
      >
        <div className="flex gap-2">
          
        </div>
      </ScrollShadow>
      <form className="flex w-full flex-col items-start rounded-medium bg-default-100 transition-colors hover:bg-default-200/70">
        <PromptInput
          classNames={{
            inputWrapper: "!bg-transparent shadow-none",
            innerWrapper: "relative",
            input: "pt-1 pl-2 pb-6 !pr-10 text-medium",
          }}
          startContent={
            <Upload {...props}>
              <Icon
                className="text-default-500 relative top-[6.5px]"
                icon="solar:paperclip-linear"
                width={18}
              />
            </Upload>
          }
          endContent={
            <div className="flex items-end gap-2">
              <div className="flex items-center gap-2">
                <Icon
                  icon="fluent:emoji-48-regular"
                  className="text-xl cursor-pointer"
                />
                <Icon
                  icon="ion:mic-outline"
                  className="text-xl cursor-pointer"
                />
                <Tooltip showArrow content="Send message">
                  <Button
                    isIconOnly
                    color={!prompt ? "default" : "primary"}
                    isDisabled={!prompt}
                    radius="lg"
                    size="sm"
                    variant="solid"
                    onClick={handleSendMessage}
                  >
                    <Icon
                      className={cn(
                        "[&>path]:stroke-[2px]",
                        !prompt ? "text-default-600" : "text-primary-foreground"
                      )}
                      icon="solar:arrow-up-linear"
                      width={20}
                    />
                  </Button>
                </Tooltip>
              </div>
            </div>
          }
          minRows={1}
          radius="lg"
          value={prompt}
          variant="flat"
          onValueChange={setPrompt}
        />

        {url && (
          <div className="p-4 group relative">
            <Image
              src={`${process.env.NEXT_PUBLIC_URL_IMG}/${url}`}
              alt="img"
              className="w-20 h-20 object-cover rounded-lg bg-white"
            />

            <div
              onClick={() => setUrl("")}
              className="absolute hidden group-hover:flex bg-gray-600 border-gray-400 rounded-full h-6 w-6  items-center justify-center top-2 z-10 right-2 cursor-pointer"
            >
              <Icon
                icon="streamline:delete-1-solid"
                className="text-white text-xs"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
