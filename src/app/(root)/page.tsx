"use client";

import { Button, ScrollShadow, Tab, Tabs } from "@nextui-org/react";
import SidebarContainer from "@/components/sidebar-with-gradient-background";
import Conversation from "@/components/conversation";
import PromptInputWithBottomActions from "@/components/prompt-input-with-bottom-actions";
import { useModal, useAccount } from "@particle-network/connectkit";
import { useEffect, useRef } from "react";
import { useQuestionContext } from "@/context/QuestionContext";
import { shortenAddress } from "@/utils/shortenAddress";

const Pionner = () => {
  const scrollRef = useRef(null);
  const { messages } = useQuestionContext();
  const { address, isConnected } = useAccount();

  const { setOpen } = useModal();

  useEffect(() => {
    if (scrollRef.current) {
      (scrollRef.current as HTMLDivElement).scrollTop = (
        scrollRef.current as HTMLDivElement
      ).scrollHeight;
    }
  }, [messages]);

  return (
    <div>
      <SidebarContainer
        header={
          <>
            {isConnected ? (
              <div onClick={() => setOpen(true)} className="cursor-pointer">
                {shortenAddress(address || "")}
              </div>
            ) : (
              <Button
                onClick={() => setOpen(true)}
                size="md"
                variant="bordered"
              >
                Connect Wallet
              </Button>
            )}
          </>
        }

      >
        <div className="relative flex h-full flex-col">
          <ScrollShadow
            ref={scrollRef}
            visibility="bottom"
            className="flex h-full max-h-[60vh] flex-col gap-6 overflow-y-auto pb-8"
          >
            <Conversation />
          </ScrollShadow>
          <div className="mt-auto flex max-w-full flex-col gap-2">
            <PromptInputWithBottomActions />
            <p className="px-2 text-tiny text-default-400">
              Acme AI can make mistakes. Consider checking important
              information.
            </p>
          </div>
        </div>
      </SidebarContainer>
    </div>
  );
};

export default Pionner;
