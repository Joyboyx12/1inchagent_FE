"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export enum MESS_TYPE {
  USER = 1,
  BOT = 2,
}

export interface Message {
  type: MESS_TYPE;
  content: string;
}

interface QuestionContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
}

const QuestionContext = createContext<QuestionContextType | undefined>(
  undefined
);

export const useQuestionContext = () => {
  const context = useContext(QuestionContext);
  if (!context) {
    throw new Error(
      "useQuestionContext must be used within a QuestionProvider"
    );
  }
  return context;
};

export const QuestionProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  // const [answers, setAnswers] = useState<Message[]>([]);

  const addMessage = (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  return (
    <QuestionContext.Provider value={{ messages, addMessage }}>
      {children}
    </QuestionContext.Provider>
  );
};
