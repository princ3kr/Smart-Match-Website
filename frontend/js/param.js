document.addEventListener("DOMContentLoaded", function() {

    const paramForm = document.getElementById("param-form");
    const submitBtn = paramForm.querySelector(".submit-btn");

    // --- 1. Get User ID from localStorage ---
    const currentUserId = localStorage.getItem('currentUserId');

    if (!currentUserId) {
        alert("Error: No user session found. Please start from the signup page.");
        window.location.href = "signup.html";
        return;
    }
    console.log(`✅ Script loaded for User ID: ${currentUserId}`);

    // --- 2. "Other" Field Logic ---
    const domainSelect = document.getElementById("domain");
    const otherDomainGroup = document.getElementById("other-domain-group");

    domainSelect.addEventListener("change", function() {
        if (this.value === "other") {
            otherDomainGroup.style.display = "block";
        } else {
            otherDomainGroup.style.display = "none";
        }
    });

    function handleOtherOption(selectElement, otherInputElement) {
        if (selectElement.value === 'other') {
            otherInputElement.style.display = 'block';
        } else {
            otherInputElement.style.display = 'none';
        }
    }

    // --- 3. Dynamic "Add Course" Logic ---
    const coursesContainer = document.getElementById("courses-container");
    const addCourseBtn = document.getElementById("add-course-btn");

    addCourseBtn.addEventListener("click", function() {
        const courseId = `course-${Date.now()}`;
        const courseCard = document.createElement("div");
        courseCard.className = "dynamic-item-card";
        courseCard.id = courseId;
        
        courseCard.innerHTML = `
            <button type="button" class="remove-btn" data-remove="${courseId}">×</button>
            <div class="input-group">
                <label for="course-name-${courseId}">Course Name</label>
                <select id="course-name-${courseId}" name="course-name" class="dynamic-select">
                    <option value="" disabled selected>Select a course</option>
                    <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Full Stack Web Development">Full Stack Web Development</option>
                    <option value="Cloud Computing (AWS/Azure)">Cloud Computing (AWS/Azure)</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="other">Other</option>
                </select>
                <input type="text" id="course-other-${courseId}" name="course-other" class="other-input" placeholder="Please specify course" style="display: none;">
            </div>
        `;
        coursesContainer.appendChild(courseCard);

        const newSelect = courseCard.querySelector('.dynamic-select');
        const newOtherInput = courseCard.querySelector('.other-input');
        newSelect.addEventListener('change', () => handleOtherOption(newSelect, newOtherInput));
    });

    // --- 4. Dynamic "Add Skill/Role" Logic ---
    const skillsContainer = document.getElementById("skills-container");
    const addSkillBtn = document.getElementById("add-skill-btn");

    addSkillBtn.addEventListener("click", function() {
        const skillId = `skill-${Date.now()}`;
        const skillCard = document.createElement("div");
        skillCard.className = "dynamic-item-card";
        skillCard.id = skillId;
        
        skillCard.innerHTML = `
            <button type="button" class="remove-btn" data-remove="${skillId}">×</button>
            <div class="input-group">
                <label for="skill-name-${skillId}">Skill/Role</label>
                <select id="skill-name-${skillId}" name="skill-name" class="dynamic-select">
                    <option value="" disabled selected>Select a skill</option>
                    <option value="Python">Python</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Java">Java</option>
                    <option value="React">React</option>
                    <option value="Node.js">Node.js</option>
                    <option value="SQL">SQL</option>
                    <option value="other">Other</option>
                </select>
                <input type="text" id="skill-other-${skillId}" name="skill-other" class="other-input" placeholder="Please specify skill" style="display: none;">
            </div>
            <div class="input-group">
                <label for="skill-years-${skillId}">Years of Experience</label>
                <input type="number" id="skill-years-${skillId}" name="skill-years" placeholder="e.g., 3" min="0" step="0.5">
            </div>
        `;
        skillsContainer.appendChild(skillCard);

        const newSelect = skillCard.querySelector('.dynamic-select');
        const newOtherInput = skillCard.querySelector('.other-input');
        newSelect.addEventListener('change', () => handleOtherOption(newSelect, newOtherInput));
    });

    // --- 5. Event Delegation for "Remove" Buttons ---
    paramForm.addEventListener("click", function(event) {
        if (event.target.classList.contains("remove-btn")) {
            const elementId = event.target.dataset.remove;
            const elementToRemove = document.getElementById(elementId);
            if (elementToRemove) {
                elementToRemove.remove();
            }
        }
    });

    // --- 6. Final Form Submission ---
    paramForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        // --- A. Collect Static Data ---
        let domainValue = domainSelect.value;
        if (domainValue === "other") {
            domainValue = document.getElementById("other-domain").value;
        }
        
        const staticData = {
            userId: parseInt(currentUserId),
            domain: domainValue || null,
            qualification: document.getElementById("qualification").value || null,
            cgpa: parseFloat(document.getElementById("cgpa").value) || null,
            gradYear: parseInt(document.getElementById("grad-year").value) || null,
            currentDesignation: document.getElementById("designation").value || null,
            currentCompany: document.getElementById("company").value || null,
            currentCTC: parseFloat(document.getElementById("ctc").value) || null
        };

        // --- B. Collect Dynamic Courses ---
        const courses = [];
        const courseCards = coursesContainer.querySelectorAll(".dynamic-item-card");
        courseCards.forEach(card => {
            const select = card.querySelector('select[name="course-name"]');
            let courseName = select.value;
            if (courseName === "other") {
                courseName = card.querySelector('input[name="course-other"]').value;
            }
            if (courseName && courseName !== "") {
                courses.push({ name: courseName });
            }
        });

        // --- C. Collect Dynamic Skills ---
        const skills = [];
        const skillCards = skillsContainer.querySelectorAll(".dynamic-item-card");
        skillCards.forEach(card => {
            const select = card.querySelector('select[name="skill-name"]');
            let skillName = select.value;
            if (skillName === "other") {
                skillName = card.querySelector('input[name="skill-other"]').value;
            }
            const years = parseFloat(card.querySelector('input[name="skill-years"]').value) || 0;
            if (skillName && skillName !== "") {
                skills.push({ name: skillName, years: years });
            }
        });

        // --- D. Projects Array (empty for now) ---
        const projects = [];

        // --- E. Combine All Data into JSON #2 ---
        const finalProfileData = {
            ...staticData,
            courses: courses,
            skills: skills,
            projects: projects
        };
        
        console.log("--- Sending JSON #2 (Profile Data) to Backend ---");
        console.log(JSON.stringify(finalProfileData, null, 2));
        
        // --- F. Show loading state & Send to Backend ---
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = "Saving Profile...";
        submitBtn.disabled = true;

        try {
            const response = await fetch('http://localhost:3000/api/register/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(finalProfileData)
            });

            const result = await response.json();

            if (response.ok) {
                // Clear user session
                localStorage.removeItem('currentUserId');
                console.log("✅ Profile data saved successfully!");
                console.log("--- User session cleared ---");
                
                alert("Profile created successfully! Redirecting to dashboard.");
                window.location.href = "/frontend/html/employee_dashboard.html";
            
            } else {
                // Show detailed error
                console.error("Server error response:", result);
                alert(`Error saving profile: ${result.message}\n\nSQL Error: ${result.sqlError || 'None'}\nError Code: ${result.code || 'Unknown'}`);
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