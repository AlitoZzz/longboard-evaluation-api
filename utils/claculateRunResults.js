function calculateRunResult(scores) {
  const judgeTotals = scores.map((score) =>
    score.scoreDetails.reduce((sum, detail) => sum + Number(detail.value), 0),
  );

  const judgeCount = judgeTotals.length;

  const finalScore =
    judgeCount > 0 ? judgeTotals.reduce((sum, total) => sum + total, 0) / judgeCount : 0;

  return {
    finalScore,
    judgeCount,
  };
}

module.exports = calculateRunResult;
