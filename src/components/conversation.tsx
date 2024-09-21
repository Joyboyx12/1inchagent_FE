"use client";

import React from "react";
import IMG from "../../public/logoAI.jpg";
import User from "../../public/logo.jpg";

import { userMessages, assistantMessages } from "./messages";

import MessageCard from "./message-card";
import { MESS_TYPE, useQuestionContext } from "@/context/QuestionContext";

export default function Component() {
  const { messages } = useQuestionContext();

  // const messages = [];

  // for (let i = 0; i < Math.max(questions.length, answers.length); i++) {
  //   if (i < questions.length) {
  //     messages.push(questions[i]);
  //   }
  //   if (i < answers.length) {
  //     messages.push(answers[i]);
  //   }
  // }

  return (
    <div className="flex flex-col gap-4 px-1">
      {messages.map((message, index) => (
        <MessageCard
          className={`${message.type === MESS_TYPE.USER ? "items-center group" : ""}`}
          key={index}
          typeMess={message.type}
          attempts={index === 1 ? 2 : 1}
          avatar={message.type === MESS_TYPE.BOT ? IMG.src : User.src}
          currentAttempt={index === 1 ? 2 : 1}
          message={message.content}
          messageClassName={
            message.type === MESS_TYPE.BOT
              ? "bg-content3 text-content3-foreground"
              : ""
          }
          showFeedback={message.type === MESS_TYPE.BOT}
        />
      ))}
    </div>
  );
}
