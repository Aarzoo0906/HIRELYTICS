import { useState } from "react";

export const QuestionCard = ({
  question,
  answer,
  onAnswerChange,
  onNext,
  isLast,
  isTimeUp,
}) => {
  const [charCount, setCharCount] = useState(answer.length);

  const handleChange = (e) => {
    const value = e.target.value;
    setCharCount(value.length);
    onAnswerChange(value);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          {question.title}
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          {question.description}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Your Answer
          </label>
          <textarea
            value={answer}
            onChange={handleChange}
            placeholder="Type your answer here..."
            disabled={isTimeUp}
            className="w-full h-48 p-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {charCount} characters
          </p>
        </div>

        <button
          onClick={onNext}
          disabled={isTimeUp && charCount === 0}
          className="w-full bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLast ? "Submit Interview" : "Next Question"}
        </button>
      </div>
    </div>
  );
};
