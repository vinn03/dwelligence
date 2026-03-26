import { useState, useCallback } from "react";
import { propertiesAPI } from "../services/api";

export const useAskProperty = (propertyId, onPOIsLoaded) => {
  const [messages, setMessages] = useState([]);
  const [isAsking, setIsAsking] = useState(false);

  const askQuestion = useCallback(async (question) => {
    if (!question.trim() || isAsking) {
      return;
    }

    const userQuestion = question.trim();
    
    const userMessage = {
      role: "user",
      content: userQuestion,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsAsking(true);

    try {
      const response = await propertiesAPI.askAboutListing(propertyId, userQuestion);

      const assistantMessage = {
        role: "assistant",
        content: response.data.answer,
        nearbyPOIs: response.data.nearbyPOIs || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (response.data.nearbyPOIs && response.data.nearbyPOIs.length > 0) {
        onPOIsLoaded?.(response.data.nearbyPOIs);
      }
    } catch (error) {
      console.error("[useAskProperty] Error:", error);

      const errorMessage = {
        role: "assistant",
        content: "I'm having trouble answering your question right now. Please try again or rephrase your question.",
        isError: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAsking(false);
    }
  }, [propertyId, isAsking, onPOIsLoaded]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isAsking,
    askQuestion,
    clearMessages,
  };
};

export default useAskProperty;
