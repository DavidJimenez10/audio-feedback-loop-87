
import { useState } from "react";
import { SalesAnalysis, SalesStage } from "../types/sales";

export const useSalesAnalysis = () => {
  const [feedback, setFeedback] = useState<SalesAnalysis>({
    type: "neutral",
    message: "Listo 👋",
    stage: 1
  });

  const analyzeSalesStage = (analysis: Partial<SalesAnalysis>) => {
    if (!analysis.stage) return;

    let feedbackType: SalesAnalysis["type"] = "neutral";
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
      ...analysis
    });
  };

  const analyzeFeedback = (content: string) => {
    const lowerContent = content.toLowerCase();
    let newFeedback: SalesAnalysis = {
      type: "neutral",
      message: "Escuchando... 👂",
      stage: 1
    };

    if (lowerContent.includes("match exitoso") || lowerContent.includes("buena conexión")) {
      newFeedback = {
        type: "positive",
        message: "Match! 🤝",
        stage: 1
      };
    } else if (lowerContent.includes("necesidad identificada")) {
      newFeedback = {
        type: "positive",
        message: "Necesidad ✅",
        stage: 2
      };
    } else if (lowerContent.includes("propuesta")) {
      newFeedback = {
        type: "neutral",
        message: "Propuesta 💡",
        stage: 3
      };
    } else if (lowerContent.includes("cierre")) {
      newFeedback = {
        type: "positive",
        message: "¡Cierra! 🎯",
        stage: 4
      };
    }

    setFeedback(newFeedback);
  };

  return {
    feedback,
    setFeedback,
    analyzeSalesStage,
    analyzeFeedback
  };
};
