document.addEventListener("DOMContentLoaded", function() {

    // --- 1. Set Page Title from localStorage ---
    const selectedJobPost = localStorage.getItem('recruiterJobPost');
    const titleElement = document.getElementById('page-title');

    if (selectedJobPost) {
        titleElement.textContent = `Parameter Weights for ${selectedJobPost}`;
    } else {
        alert("Please select a job role first.");
        window.location.href = "domain.html";
        return;
    }

    // --- 2. "Sum-to-100" Slider Logic ---
    
    const weightingForm = document.getElementById("weighting-form");
    if (!weightingForm) {
        console.error("Form not found!");
        return;
    }
    
    const sliders = [
        { input: document.getElementById("education-weight"), span: document.getElementById("education-weight-value") },
        { input: document.getElementById("experience-weight"), span: document.getElementById("experience-weight-value") },
        { input: document.getElementById("skills-weight"), span: document.getElementById("skills-weight-value") },
        { input: document.getElementById("projects-weight"), span: document.getElementById("projects-weight-value") }
    ];

    const totalWeightDisplay = document.getElementById("total-weight-display");
    const totalWeightLimit = 100;

    function updateDisplay() {
        let currentTotal = 0;
        sliders.forEach(slider => {
            const value = parseInt(slider.input.value);
            slider.span.textContent = `${value}%`;
            currentTotal += value;
        });
        totalWeightDisplay.textContent = `Total Weight: ${currentTotal}%`;
        
        if (currentTotal === 100) {
            totalWeightDisplay.style.color = "var(--primary-pink)";
        } else {
            totalWeightDisplay.style.color = "var(--text-light)";
        }
    }

    function handleSliderInput(changedSlider) {
        let currentTotal = 0;
        sliders.forEach(s => {
            currentTotal += parseInt(s.input.value);
        });

        if (currentTotal > totalWeightLimit) {
            const overage = currentTotal - totalWeightLimit;
            const newValue = parseInt(changedSlider.input.value) - overage;
            changedSlider.input.value = newValue;
        }
        updateDisplay();
    }

    sliders.forEach(slider => {
        slider.input.addEventListener("input", () => handleSliderInput(slider));
    });

    updateDisplay();

    // --- 3. Form Submission Logic (UPDATED TO SEND TO BACKEND) ---
    
    weightingForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        // Get recruiter ID from localStorage
        const recruiterId = localStorage.getItem('currentRecruiterId');
        
        if (!recruiterId) {
            alert("Error: No recruiter session found. Please log in again.");
            window.location.href = "recruiter_signup.html";
            return;
        }

        // --- A. Check if weights sum to 100 ---
        let currentTotal = 0;
        sliders.forEach(slider => {
            currentTotal += parseInt(slider.input.value);
        });

        if (currentTotal !== 100) {
            alert("Error: The main weights must sum to exactly 100%. Your current total is " + currentTotal + "%.");
            return;
        }

        // --- B. Collect Main Weights ---
        const mainWeights = {
            education: parseInt(document.getElementById("education-weight").value),
            experience: parseInt(document.getElementById("experience-weight").value),
            skills: parseInt(document.getElementById("skills-weight").value),
            projects: parseInt(document.getElementById("projects-weight").value),
        };

        // --- C. Get Job/Domain from localStorage ---
        const selectedDomain = localStorage.getItem('recruiterJobDomain');
        const selectedPost = localStorage.getItem('recruiterJobPost');

        // --- D. Collect Thresholds ---
        const thresholds = {
            education: {
                cgpaMin: parseFloat(document.getElementById("cgpa-threshold").value) || null,
                qualificationMin: document.getElementById("qualification-threshold").value
            },
            job: {
                domain: selectedDomain,
                targetRole: selectedPost
            },
            experience: {
                minYears: parseInt(document.getElementById("exp-min").value) || null,
                maxYears: parseInt(document.getElementById("exp-max").value) || null
            }
        };

        // --- E. Combine into one JSON object ---
        const jobPostingData = {
            recruiterId: parseInt(recruiterId),
            jobDomain: selectedDomain,
            jobPost: selectedPost,
            jobTitle: selectedPost, // Can be customized later
            jobDescription: null, // Can add a description field later
            location: null, // Can add location field later
            salaryRange: null, // Can add salary field later
            mainWeights: mainWeights,
            thresholds: thresholds
        };
        
        console.log("--- Sending Job Posting Data to Backend ---");
        console.log(JSON.stringify(jobPostingData, null, 2));

        // Show loading state
        const submitBtn = weightingForm.querySelector('.submit-btn');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = "Saving Configuration...";
        submitBtn.disabled = true;

        try {
            const response = await fetch('http://localhost:3000/api/recruiter/job-posting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jobPostingData)
            });

            const result = await response.json();

            if (response.ok) {
                console.log(`✅ Job posting created with ID: ${result.jobId}`);
                
                // Clear localStorage items
                localStorage.removeItem('recruiterJobDomain');
                localStorage.removeItem('recruiterJobPost');
                
                alert("✅ Job posting created successfully! Redirecting to dashboard...");
                
                // Redirect to recruiter dashboard
                window.location.href = "/frontend/html/recruiter_dashboard.html";
            
            } else {
                console.error("Server error response:", result);
                alert(`Error: ${result.message}`);
            }

        } catch (error) {
            console.error("Network error:", error);
            alert("Could not connect to the server. Please check:\n1. Backend is running on port 3000\n2. No firewall blocking the connection");
        
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });

});