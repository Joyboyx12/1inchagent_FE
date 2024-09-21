// openai-client.ts
import OpenAI from "openai/index.mjs";

// Define the structure of the data library for better type safety
interface ChainData {
    name: string;
    addresses: string;
}

interface DataLibraries {
    [key: string]: ChainData;
}

// Define the data libraries with explicit types
const dataLibraries: DataLibraries = {
    "1": {
        name: "Ethereum",
        addresses: "ETH: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, DAI: 0x6b175474e89094c44da98b954eedeac495271d0f, USDT: 0xdac17f958d2ee523a2206206994597c13d831ec7, USDC: 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48, BNB: 0xB8c77482e45F1F44dE1745F52C74426C631bDD52, WETH: 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
    },
    "137": {
        name: "Polygon",
        addresses: "Matic: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, WETH: 0x7ceb23fd6bc0add59e62ac25578270cff1b9f619, USDT: 0xc2132d05d31c914a87c6611c10748aeb04b58e8f, BNB: 0x3BA4c387f786bFEE076A58914F5Bd38d668B42c3, USDC: 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"
    }
};
const openAi = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // Ensure your API key is set in the environment variables
    dangerouslyAllowBrowser: true, // Enable this with caution
});

async function sendToken(messages: string){
    const setup = 'Identify the transfer transaction command and respond in json example: { to: address token: example ETH/ USDT amount: (Convert to wei) message: "Sending the transaction, please wait"}}. User answer: '+messages;
    try {
        const response = await openAi.chat.completions.create({
            messages: [{ role: 'user', content: setup }],
            model: 'gpt-3.5-turbo', // You can switch to other models if needed
            temperature: 0.2,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("Error sending prompt to OpenAI:", error);
        throw error;
    }
    
}

async function QA(messages:string){
    const setup = 'Answer the answer from users and respond in json example {message: ""}. User answer: '+messages;
   
    try {
        const response = await openAi.chat.completions.create({
            messages: [{ role: 'user', content: setup }],
            model: 'gpt-3.5-turbo', // You can switch to other models if needed
            temperature: 1,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("Error sending prompt to OpenAI:", error);
        throw error;
    }
}

async function swap(messages: string){


    // Safely access chain data using TypeScript's type system
    const chainID = JSON.parse(messages).chain
    console.log (chainID)
    const chainData = dataLibraries[chainID as keyof DataLibraries]; // Type assertion for key access

// Construct the setup message
    const setup = chainData ? `Data library: [${chainData.name} chain - ChainID: ${chainID} ${chainData.addresses}]; ` +
    'Process: Identify the transfer transaction command and respond in json. Example: ' +
    'User prompt: Swap 1 ETH to DAI Response as Json: { chain: 1, src: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", ' +
    'dst: "0x6b175474e89094c44da98b954eedeac495271d0f", amount: 1, slippage: 5 , message: "Swapping, please wait!"}. ' +
    `User answer: ${messages}` : "Your chain currently we are not support";
    
    console.log ("Sending to OpenAI prompt " + setup);
      try {
        const response = await openAi.chat.completions.create({
            messages: [{ role: 'user', content: setup }],
            model: 'gpt-3.5-turbo', // You can switch to other models if needed
            temperature: 0.1,
        });
        console.log(response.choices[0].message.content)
        return response.choices[0].message.content;
    } catch (error) {
        console.error("Error swap to OpenAI:", error);
        throw error;
    }
    
}

export const sendPromptToOpenAI = async (messages: string) => {
    const initial_prompt = 'Identify user input and response content in the correct form "Swap" if transfer token A to Token B, "Deploy" if Deploy the contract, "Send" if Send money to other, "QA" if Asking about the project, "Undefined". User content:' + messages;

    try {
        const response: OpenAI.Chat.Completions.ChatCompletion = await openAi.chat.completions.create({
            messages: [{ role: 'user', content: initial_prompt }],
            model: 'gpt-3.5-turbo',
            temperature: 0.2,
        });
    
        // Ensure response and choices are not null or undefined
        if (response?.choices && response.choices.length > 0) {
            const choiceContent = response.choices[0]?.message?.content?.trim();
    
            if (choiceContent) {
                let jsonObject = { type: choiceContent };
    
                if (choiceContent === "Send") {
                    const sendTokenResult = await sendToken(messages);
                    const parsedResult = JSON.parse(String(sendTokenResult)); // Ensure the response is a string and parse it
                    jsonObject = { ...jsonObject, ...parsedResult }; // Merge the parsed result into jsonObject
                }
                if (choiceContent === "Swap")
                {
                    const swapResult = await swap(messages);
                    const parsedResult = JSON.parse(String(swapResult)); // Ensure the response is a string and parse it
                    jsonObject = { ...jsonObject, ...parsedResult }; // Merge the parsed result into jsonObject
                }
                if (choiceContent == "QA")
                {
                    const swapResult = await QA(messages);
                    const parsedResult = JSON.parse(String(swapResult)); // Ensure the response is a string and parse it
                    jsonObject = { ...jsonObject, ...parsedResult }; // Merge the parsed result into jsonObject

                }
                return jsonObject;
            }
        } else {
            console.error("No valid choices returned from OpenAI");
            throw new Error("Invalid response from OpenAI");
        }
    
    } catch (error) {
        console.error("Error prompt choosing to OpenAI:", error);
        throw error;
    }
    
    
};
