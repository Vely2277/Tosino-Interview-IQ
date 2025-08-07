"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface InterviewData {
  jobTitle: string;
  company: string;
}

interface InterviewContextType {
  interviewData: InterviewData;
  setInterviewData: (data: InterviewData) => void;
  updateInterviewData: (data: Partial<InterviewData>) => void;
}

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export function InterviewProvider({ children }: { children: ReactNode }) {
  const [interviewData, setInterviewData] = useState<InterviewData>({
    jobTitle: "",
    company: "",
  });

  const updateInterviewData = (data: Partial<InterviewData>) => {
    setInterviewData(prev => ({ ...prev, ...data }));
  };

  return (
    <InterviewContext.Provider value={{
      interviewData,
      setInterviewData,
      updateInterviewData,
    }}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const context = useContext(InterviewContext);
  if (context === undefined) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }
  return context;
}
