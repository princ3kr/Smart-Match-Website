document.getElementById("locationWeight").addEventListener("input", e => {
  document.getElementById("locVal").textContent = e.target.value;
});
document.getElementById("experienceWeight").addEventListener("input", e => {
  document.getElementById("expVal").textContent = e.target.value;
});
document.getElementById("techWeight").addEventListener("input", e => {
  document.getElementById("techVal").textContent = e.target.value;
});

document.getElementById("runMatch").addEventListener("click", () => {
  const weights = {
    location: parseFloat(document.getElementById("locationWeight").value),
    experience: parseFloat(document.getElementById("experienceWeight").value),
    tech: parseFloat(document.getElementById("techWeight").value)
  };

  const scoredProfiles = profiles.map(p => {
    return {
      ...p,
      compositeScore: calculateCompositeScore(p, weights)
    };
  });

  scoredProfiles.sort((a, b) => b.compositeScore - a.compositeScore);

  const tbody = document.querySelector("#resultsTable tbody");
  tbody.innerHTML = "";
  scoredProfiles.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>${p.compositeScore}</td>
      <td>
        Location: ${p.locationScore ?? "N/A"} |
        Experience: ${p.experienceScore ?? "N/A"} |
        Tech: ${p.techScore ?? "N/A"}
      </td>
    `;
    tbody.appendChild(tr);
  });
});
