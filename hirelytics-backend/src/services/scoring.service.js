export const calculateScore = (questions = []) => {
  let total = 0;

  questions.forEach((q) => {
    total += q.score || 0;
  });

  return total;
};