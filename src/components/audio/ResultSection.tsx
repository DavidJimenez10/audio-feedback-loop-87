
import { FeedbackDisplay } from "./FeedbackDisplay";
import { EvaluationDisplay } from "./EvaluationDisplay";
import { AnalysisResult } from "./AnalysisResult";
import { SalesAnalysis } from "@/types/sales";

interface ResultSectionProps {
  feedback: SalesAnalysis;
  evaluationHtml: string | null;
  analysisResult: string | null;
  onDownload: () => void;
}

export const ResultSection = ({
  feedback,
  evaluationHtml,
  analysisResult,
  onDownload
}: ResultSectionProps) => {
  return (
    <>
      {feedback.message && !evaluationHtml && (
        <div className="mt-6">
          <FeedbackDisplay 
            type={feedback.type}
            message={feedback.message}
            stage={feedback.stage}
          />
        </div>
      )}

      {evaluationHtml && (
        <EvaluationDisplay htmlContent={evaluationHtml} />
      )}

      {analysisResult && !evaluationHtml && (
        <div className="mt-6">
          <AnalysisResult
            filename={analysisResult}
            onDownload={onDownload}
          />
        </div>
      )}
    </>
  );
};

