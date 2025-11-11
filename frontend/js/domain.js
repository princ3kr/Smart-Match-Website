document.addEventListener("DOMContentLoaded", function() {

    const domainForm = document.getElementById("domain-form");
    const domainSelect = document.getElementById("job-domain");
    const postGroup = document.getElementById("job-post-group");
    const postSelect = document.getElementById("job-post");
    const submitBtn = document.getElementById("submit-btn");

    // This is our "database" of roles for each domain
    // (Moved from recruiter.js)
    const domainRolesMap = {
        "cse-it": [
            "Software Development Engineer (SDE)", "Data Scientist", "DevOps Engineer", "Machine Learning Engineer",
            "Full Stack Developer", "Backend Developer", "Frontend Developer", "Cloud Engineer",
            "Database Administrator", "Cybersecurity Analyst"
        ],
        "ece": [
            "Electronics Engineer", "VLSI Engineer", "Hardware Engineer", "Telecommunications Engineer",
            "Embedded Systems Engineer", "Network Engineer", "RF Engineer", "Systems Analyst",
            "Instrumentation Engineer", "Signal Processing Engineer"
        ],
        "eee": [
            "Electrical Engineer", "Power Systems Engineer", "Control Systems Engineer", "Renewable Energy Engineer",
            "Electronics Engineer", "Substation Engineer", "Electrical Design Engineer", "Automation Engineer",
            "Instrumentation Engineer", "Project Engineer (Electrical)"
        ],
        "mechanical": [
            "Mechanical Engineer", "Design Engineer", "Manufacturing Engineer", "Automotive Engineer",
            "HVAC Engineer", "Robotics Engineer", "Aerospace Engineer", "Thermal Engineer",
            "QA/QC Engineer", "Maintenance Engineer"
        ],
        "mba": [
            "Management Consultant", "Product Manager", "Marketing Manager", "Financial Analyst",
            "HR Manager", "Business Development Manager", "Operations Manager", "Supply Chain Manager",
            "Project Manager", "Investment Banker"
        ],
        "ca": [
            "Chartered Accountant", "Finance Manager", "Audit Manager", "Tax Consultant",
            "Statutory Auditor", "Internal Auditor", "Financial Controller", "Forensic Accountant",
            "Risk Manager", "Accounts Executive"
        ]
    };

    // --- 1. Populate Job Posts when Domain changes ---
    domainSelect.addEventListener("change", function() {
        const selectedDomain = this.value;
        const roles = domainRolesMap[selectedDomain];

        // Clear previous options
        postSelect.innerHTML = '<option value="" disabled selected>Select a job post...</option>';
        submitBtn.disabled = true; // Disable button until a post is selected

        if (roles && roles.length > 0) {
            // If we have roles, populate the second dropdown
            roles.forEach(role => {
                const option = document.createElement("option");
                option.value = role;
                option.textContent = role;
                postSelect.appendChild(option);
            });
            // Show the "Job Post" dropdown
            postGroup.style.display = "block";
        } else {
            // Hide if no roles
            postGroup.style.display = "none";
        }
    });
    
    // --- 2. Enable Button when Job Post is selected ---
    postSelect.addEventListener("change", function() {
        if (this.value) {
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
        }
    });

    // --- 3. Form Submission ---
    domainForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const selectedDomain = domainSelect.value;
        const selectedPost = postSelect.value;
        
        // Save the selections to localStorage for the next page
        localStorage.setItem('recruiterJobDomain', selectedDomain);
        localStorage.setItem('recruiterJobPost', selectedPost);

        console.log(`Domain: ${selectedDomain}, Post: ${selectedPost} saved to localStorage.`);
        
        // Redirect to the weighting page
        window.location.href = "/frontend/html/recruiter.html";
    });

});