// Helper file for sentiment sorting and styles
export const SENTIMENT_ORDER = [
  "Very Positive",
  "Positive",
  "Slightly Positive",
  "Neutral",
  "Mixed",
  "Slightly Negative",
  "Negative",
  "Very Negative"
];

export function normalizeSentiment(sentiment) {
  const value = (sentiment || "Neutral").toString().toLowerCase();
  if (value.includes("very positive")) return "Very Positive";
  if (value.includes("slightly positive")) return "Slightly Positive";
  if (value.includes("positive")) return "Positive";
  if (value.includes("very negative")) return "Very Negative";
  if (value.includes("slightly negative")) return "Slightly Negative";
  if (value.includes("negative")) return "Negative";
  if (value.includes("mixed")) return "Mixed";
  return "Neutral";
}

export function sentimentTone(sentiment) {
  const normalized = normalizeSentiment(sentiment).toLowerCase();
  if (normalized.includes("positive")) return "positive";
  if (normalized.includes("negative")) return "negative";
  if (normalized.includes("mixed")) return "mixed";
  return "neutral";
}

export function sentimentScore(sentiment) {
  const normalized = normalizeSentiment(sentiment);
  switch (normalized) {
    case "Very Positive": return 95;
    case "Positive": return 82;
    case "Slightly Positive": return 68;
    case "Mixed": return 55;
    case "Neutral": return 50;
    case "Slightly Negative": return 38;
    case "Negative": return 20;
    case "Very Negative": return 8;
    default: return 50;
  }
}

const styleMap = {
  "Very Positive": { color: "#22c55e", bg: "rgba(34, 197, 94, 0.12)", border: "rgba(34, 197, 94, 0.25)", icon: "🤩" },
  "Positive": { color: "#10b981", bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.25)", icon: "😊" },
  "Slightly Positive": { color: "#34d399", bg: "rgba(52, 211, 153, 0.12)", border: "rgba(52, 211, 153, 0.25)", icon: "🙂" },
  "Neutral": { color: "#fbbf24", bg: "rgba(251, 191, 36, 0.12)", border: "rgba(251, 191, 36, 0.25)", icon: "😐" },
  "Mixed": { color: "#38bdf8", bg: "rgba(56, 189, 248, 0.12)", border: "rgba(56, 189, 248, 0.25)", icon: "🌀" },
  "Slightly Negative": { color: "#fca5a5", bg: "rgba(252, 165, 165, 0.12)", border: "rgba(252, 165, 165, 0.25)", icon: "🙁" },
  "Negative": { color: "#f87171", bg: "rgba(248, 113, 113, 0.12)", border: "rgba(248, 113, 113, 0.25)", icon: "😠" },
  "Very Negative": { color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)", border: "rgba(239, 68, 68, 0.25)", icon: "🔥" }
};

export function getSentimentVisual(sentiment) {
  const normalized = normalizeSentiment(sentiment);
  return styleMap[normalized] || styleMap["Neutral"];
}

// Get background color based on sentiment for animation
export function getSentimentBackgroundColor(sentiment) {
  const normalized = (sentiment || "Neutral").toString().toLowerCase();
  
  // Negative = Red
  if (normalized.includes("negative")) {
    return {
      gradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.08) 50%, rgba(239, 68, 68, 0.15) 100%)",
      glowColor: "rgba(239, 68, 68, 0.3)",
      name: "negative"
    };
  }
  
  // Positive = Green
  if (normalized.includes("positive")) {
    return {
      gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 50%, rgba(16, 185, 129, 0.15) 100%)",
      glowColor: "rgba(16, 185, 129, 0.3)",
      name: "positive"
    };
  }
  
  // Neutral = Gray/Default
  return {
    gradient: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(59, 130, 246, 0.06) 50%, rgba(139, 92, 246, 0.12) 100%)",
    glowColor: "rgba(99, 102, 241, 0.2)",
    name: "neutral"
  };
}
