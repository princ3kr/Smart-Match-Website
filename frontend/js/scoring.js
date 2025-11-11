function calculateCompositeScore(profile, weights) {
  let totalWeight = 0;
  let totalScore = 0;

  for (let key in weights) {
    let weight = weights[key];
    totalWeight += weight;
    let score = profile[key + "Score"];
    if (score === null || score === undefined) {
      score = 5; // default score for missing data
    }
    totalScore += score * weight;
  }

  return (totalScore / totalWeight).toFixed(2);
}
