import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const HistoryContext = createContext<{
  history: { _id: string; prompt: string; image: string }[];
  setHistory: React.Dispatch<React.SetStateAction<{ _id: string; prompt: string; image: string }[]>>;
  addHistoryItem: (item: { _id: string; prompt: string; image: string }) => void;
}>({
  history: [],
  setHistory: () => {},
  addHistoryItem: () => {},
});

export const HistoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [history, setHistory] = useState<{ _id: string; prompt: string; image: string }[]>([]);

  // Load history from AsyncStorage on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const local = await AsyncStorage.getItem("history");
        if (local) setHistory(JSON.parse(local));
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };
    loadHistory();
  }, []);

  // Add new item safely
  const addHistoryItem = (item: { _id: string; prompt: string; image: string }) => {
    setHistory(prev => {
      const updated = [item, ...prev];
      AsyncStorage.setItem("history", JSON.stringify(updated)).catch(err =>
        console.error("Failed to save history:", err)
      );
      return updated;
    });
  };

  return (
    <HistoryContext.Provider value={{ history, setHistory, addHistoryItem }}>
      {children}
    </HistoryContext.Provider>
  );
};
