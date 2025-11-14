document.addEventListener("DOMContentLoaded", function() {

    const detailsForm = document.getElementById("details-form");
    const submitBtn = detailsForm.querySelector(".submit-btn");

    // --- 1. Check if form exists ---
    if (!detailsForm) {
        console.error("Error: details-form not found!");
        return;
    }

    // --- 2. Get Auth Data from localStorage ---
    const userAuthJSON = localStorage.getItem('newUserAuth');
    
    if (!userAuthJSON) {
        alert("Error: No signup data found. Please sign up again.");
        window.location.href = "/frontend/html/signup.html";
        return;
    }
    
    const userAuthData = JSON.parse(userAuthJSON);
    console.log("--- Auth Data Retrieved from localStorage ---");
    console.log(userAuthData);

    // --- 3. Form Submission ---
    detailsForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        // Get details data from form
        const userDetailsData = {
            fullName: document.getElementById("full-name").value,
            dob: document.getElementById("dob").value,
            phone: document.getElementById("phone").value,
            city: document.getElementById("city").value,
            state: document.getElementById("state").value
        };

        // Validation
        if (!userDetailsData.fullName || !userDetailsData.dob || !userDetailsData.phone || !userDetailsData.city || !userDetailsData.state) {
            alert("Please fill in all fields.");
            return;
        }

        // Combine auth + details into ONE JSON object
        const combinedUserData = {
            ...userAuthData,
            ...userDetailsData
        };
        
        console.log("--- Sending JSON #1 (Complete User Data) to Backend ---");
        console.log(JSON.stringify(combinedUserData, null, 2));

        // Show loading state
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = "Creating Account...";
        submitBtn.disabled = true;

        // Send to backend
        try {
            const response = await fetch('http://localhost:3000/api/register/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(combinedUserData)
            });

            const result = await response.json();

            if (response.ok) {
                console.log(`✅ User created successfully with ID: ${result.userId}`);
                
                localStorage.setItem('currentUserId', result.userId);
                
                localStorage.removeItem('newUserAuth');

                console.log("--- User session created. Redirecting to profile page ---");
                alert("Account created successfully! Now complete your professional profile.");
                window.location.href = "/frontend/html/param.html";
            
            } else {
                // Error from server
                console.error("Server error response:", result);
                alert("Error saving details: " + result.message);
            }

        } catch (error) {
            console.error("Network error:", error);
            alert("Could not connect to the server. Please check:\n1. Backend is running on port 3000\n2. No firewall blocking the connection");
        
        } finally {
            // Reset button state
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});
