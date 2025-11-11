document.getElementById("recruiterDetailsForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const signupData = JSON.parse(localStorage.getItem("recruiterSignup"));
  
  if (!signupData) {
    alert("Error: No signup data found. Please start from the signup page.");
    window.location.href = "recruiter_signup.html";
    return;
  }

  const udyamFile = document.getElementById("udyam").files[0];

  if (!udyamFile) {
    alert("Please upload your UDYAM verification document.");
    return;
  }

  const recruiterData = {
    email: signupData.email,
    password: signupData.password,
    name: document.getElementById("name").value.trim(),
    position: document.getElementById("position").value.trim(),
    company: document.getElementById("company").value.trim(),
    location: document.getElementById("location").value.trim(),
    udyamFileName: udyamFile.name
  };

  try {
    const response = await fetch('http://localhost:3000/api/register/recruiter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(recruiterData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ Recruiter created with ID: ${result.recruiterId}`);
      
      localStorage.setItem('currentRecruiterId', result.recruiterId);
      localStorage.removeItem('recruiterSignup');

      alert("Details saved successfully ✅");
      window.location.href = "/frontend/html/domain.html";
    } else {
      alert("Error: " + result.message);
    }

  } catch (error) {
    console.error("Network error:", error);
    alert("Could not connect to the server. Please check if the backend is running.");
  }
});