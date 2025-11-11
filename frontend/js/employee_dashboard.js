// Toggle dropdown menu
const menuIcon = document.getElementById("menu-icon");
const dropdownMenu = document.getElementById("dropdown-menu");

menuIcon.addEventListener("click", () => {
  dropdownMenu.classList.toggle("active");
});

window.addEventListener("click", (e) => {
  if (!menuIcon.contains(e.target) && !dropdownMenu.contains(e.target)) {
    dropdownMenu.classList.remove("active");
  }
});

// Logout handler
document.querySelector("#dropdown-menu a:last-child").addEventListener("click", (e) => {
  e.preventDefault();
  alert("You have been logged out!");
  window.location.href = "home.html";
});

// Sample jobs data (you can later fetch from API)
const jobs = [
  { title: "Senior Developer", company: "TechCorp", salary: "$120k - $150k" },
  { title: "ML Engineer", company: "DataSys", salary: "$130k - $160k" },
  { title: "DevOps Engineer", company: "CloudNet", salary: "$110k - $140k" },
  { title: "Full Stack Developer", company: "StartupXYZ", salary: "$100k - $130k" },
  { title: "Frontend Developer", company: "FinTech Inc", salary: "$90k - $120k" },
  { title: "Data Scientist", company: "AI Labs", salary: "$140k - $170k" },
];

// Dynamically display jobs
const jobGrid = document.getElementById("jobGrid");
jobs.forEach(job => {
  const card = document.createElement("div");
  card.classList.add("job-card");
  card.innerHTML = `
    <div class="job-header">
      <i>💼</i>
      <div>
        <div class="job-title">${job.title}</div>
        <div class="job-company">${job.company}</div>
      </div>
    </div>
    <div class="job-salary">${job.salary}</div>
    <button class="apply-btn">Apply Now</button>
  `;
  jobGrid.appendChild(card);
});
