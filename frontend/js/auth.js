// Show Login Form
document.getElementById("loginBtn").addEventListener("click", () => {
  document.getElementById("mainButtons").classList.add("hidden");
  document.getElementById("introText").classList.add("hidden");
  document.getElementById("signupForm").classList.add("hidden");
  document.getElementById("loginForm").classList.remove("hidden");
});

// Show Signup Form
document.getElementById("signupBtn").addEventListener("click", () => {
  document.getElementById("mainButtons").classList.add("hidden");
  document.getElementById("introText").classList.add("hidden");
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("signupForm").classList.remove("hidden");
});

// Back buttons
document.getElementById("backToMain1").addEventListener("click", goBack);
document.getElementById("backToMain2").addEventListener("click", goBack);

function goBack() {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("signupForm").classList.add("hidden");
  document.getElementById("mainButtons").classList.remove("hidden");
  document.getElementById("introText").classList.remove("hidden");
}

// Browse Mode
document.getElementById("browseBtn").addEventListener("click", () => {
  alert("Browsing limited demo mode...");
});


document.getElementById("signupSubmit").addEventListener("click", () => {
  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const name = document.getElementById("signupName").value.trim();
  const age = document.getElementById("signupAge").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const college = document.getElementById("signupCollege").value.trim();
  const address = document.getElementById("signupAddress").value.trim();
  const role = document.getElementById("signupRole").value;

  if (!username || !password || !name || !email) {
    alert("⚠️ Please fill in all required fields (Username, Password, Name, Email).");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  const exists = users.find(u => u.username === username);
  if (exists) {
    alert("⚠️ Username already exists. Try another one.");
    return;
  }

  const newUser = { username, password, name, age, email, college, address, role };
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  alert("✅ Signup successful! You can now login.");
  goBack();
});

// ========== Login Logic ==========
document.getElementById("loginSubmit").addEventListener("click", () => {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const role = document.getElementById("loginRole").value;

  if (!username || !password) {
    alert("⚠️ Please fill in both username and password.");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  const found = users.find(u => u.username === username && u.password === password && u.role === role);

  if (!found) {
    alert("❌ Invalid credentials or wrong role.");
    return;
  }

  localStorage.setItem("currentUser", JSON.stringify(found));
  alert(`✅ Welcome, ${found.name || found.username}! Redirecting...`);

  if (found.role === "recruiter") {
    window.location.href = "/frontend/html/recruiter.html";
  } else {
    window.location.href = "/frontend/html/employee.html";
  }
});
