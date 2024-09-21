export const shortenAddress = (address: string, chars = 4): string => {
    const parsed = address;
   
    return `${parsed.substring(0, chars + 2)}...${parsed.substring(38 - chars)}`;
  };