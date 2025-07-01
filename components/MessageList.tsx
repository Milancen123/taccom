"use client"
import React, { memo } from "react";
import FormattedDate from "./FormattedDate";
import Message from "./Message";
import NewMessage from "./NewMessage";
import ScrollDownArrow from "./ScrollDownArrow";

const MessageList = memo(({ messages, currentUser, newMessageRef, formatTime }: any) => {
  let lastRenderedDate: string | null = null;
  let newMessages = false;

  return (
    <>
      {messages.map((message: any, index: number) => {
        const currentDate = new Date(message.timestamp || message.created_at).toDateString();
        const shouldRenderDate = currentDate !== lastRenderedDate;
        lastRenderedDate = currentDate;

        let shouldShowNewMessage;
        if (
          message.newMessage &&
          message.sender !== currentUser.username &&
          message.username !== currentUser.username
        ) {
          shouldShowNewMessage = !newMessages && message.newMessage;
          if (shouldShowNewMessage) {
            newMessages = true;
          }
        }

        return (
          <React.Fragment key={`${message.sender}-${message.timestamp || message.created_at}-${index}`}>
            {shouldRenderDate && (
              <FormattedDate timestamp={message.timestamp || message.created_at} />
            )}
            {shouldShowNewMessage && (
              <div ref={newMessageRef}>
                <NewMessage />
              </div>
            )}
            <ScrollDownArrow />
            <Message
              img_url={"https://avatars.githubusercontent.com/u/124599?v=4"}
              name={message.sender || message.username}
              date={currentDate}
              time={formatTime(message.timestamp || message.created_at)}
              message={message.message || message.content}
              sentByMe={
                message.sender === currentUser.username ||
                message.username === currentUser.username
              }
            />
          </React.Fragment>
        );
      })}
    </>
  );
});

export default MessageList;
