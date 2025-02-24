
import { useState } from "react";
import { SalesAnalysis, SalesStage } from "../types/sales";

interface FeedbackState {
  type: "positive" | "neutral" | "negative";
  message: string;
  stage?: SalesStage;
  analysis?: Partial<SalesAnalysis>;
}

export const useSalesAnalysis = () => {
  const [feedback, setFeedback] = useState<FeedbackState>({
    type: "neutral",
    message: "Listo 👋",
  });

  const analyzeSalesStage = (analysis: Partial<SalesAnalysis>) => {
    if (!analysis.stage) return;

    let feedbackType: FeedbackState["type"] = "neutral";
    let message = "";

    switch (analysis.stage) {
      case 1:
        if (analysis.matchScore && analysis.matchScore > 0.8) {
          message = "Buen match! 🤝";
          feedbackType = "positive";
        } else {
          message = "Más rapport 🎯";
          feedbackType = "negative";
        }
        break;
      case 2:
        if (analysis.needsIdentified?.length) {
          message = `${analysis.needsIdentified.length} necesidades ✅`;
          feedbackType = "positive";
        } else {
          message = "Indaga más 🔍";
          feedbackType = "neutral";
        }
        break;
      case 3:
        if (analysis.brandValues) {
          message = "Valores ✨";
          feedbackType = "positive";
        } else {
          message = "Resalta marca ⭐";
          feedbackType = "neutral";
        }
        break;
      case 4:
        if (analysis.closingTechnique) {
          message = "¡Cierra! 🎯";
          feedbackType = "positive";
        } else {
          message = "Busca cierre 🎯";
          feedbackType = "neutral";
        }
        break;
    }

    setFeedback({
      type: feedbackType,
      message,
      stage: analysis.stage as SalesStage,
      analysis
    });
  };

  const analyzeFeedback = (content: string) => {
    const lowerContent = content.toLowerCase();
    let feedbackState: FeedbackState = {
      type: "neutral",
      message: "Escuchando... 👂"
    };

    if (lowerContent.includes("match exitoso") || lowerContent.includes("buena conexión")) {
      feedbackState = {
        type: "positive",
        message: "Match! 🤝",
        stage: 1 as SalesStage
      };
    } else if (lowerContent.includes("necesidad identificada")) {
      feedbackState = {
        type: "positive",
        message: "Necesidad ✅",
        stage: 2 as SalesStage
      };
    } else if (lowerContent.includes("propuesta")) {
      feedbackState = {
        type: "neutral",
        message: "Propuesta 💡",
        stage: 3 as SalesStage
      };
    } else if (lowerContent.includes("cierre")) {
      feedbackState = {
        type: "positive",
        message: "¡Cierra! 🎯",
        stage: 4 as SalesStage
      };
    }

    setFeedback(feedbackState);
  };

  return {
    feedback,
    setFeedback,
    analyzeSalesStage,
    analyzeFeedback
  };
};
