import { Calendar, FileText } from "lucide-react";

export interface QuestionSnapshotData {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
  file_url?: string | null;
  user_id?: string;
  contact_method?: string;
  urgency?: string;
}

interface QuestionSnapshotProps {
  question: QuestionSnapshotData;
}

export function QuestionSnapshot({ question }: QuestionSnapshotProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const truncateText = (text?: string, maxLength: number = 60) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
          {truncateText(question?.title, 60)}
        </h4>
        {question?.file_url && (
          <FileText className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
        )}
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
        {truncateText(question?.description, 120)}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(question?.created_at)}</span>
        </div>
        <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
          {question?.category || "General"}
        </span>
      </div>
    </div>
  );
}
