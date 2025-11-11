document.addEventListener("DOMContentLoaded", async function() {

    // Check if recruiter is logged in
    const recruiterId = localStorage.getItem('currentRecruiterId');
    
    if (!recruiterId) {
        alert("Please log in first.");
        window.location.href = "recruiter_signup.html";
        return;
    }

    // --- 1. Load Recruiter Info ---
    try {
        const recruiterResponse = await fetch(`http://localhost:3000/api/recruiter/profile/${recruiterId}`);
        const recruiterData = await recruiterResponse.json();
        
        if (recruiterResponse.ok) {
            document.getElementById('recruiterName').textContent = recruiterData.recruiter.full_name;
        }
    } catch (error) {
        console.error("Error loading recruiter info:", error);
    }

    // --- 2. Load All Jobs for This Recruiter ---
    await loadJobs();

    // --- 3. Event Listeners ---
    document.getElementById('createJobBtn').addEventListener('click', function() {
        window.location.href = "domain.html";
    });

    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('currentRecruiterId');
        alert("Logged out successfully!");
        window.location.href = "home.html";
    });

    document.getElementById('closeModal').addEventListener('click', function() {
        document.getElementById('matchesModal').style.display = 'none';
    });

    // Close modal when clicking outside
    document.getElementById('matchesModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });

});

// Function to load all jobs
async function loadJobs() {
    const recruiterId = localStorage.getItem('currentRecruiterId');
    const jobsGrid = document.getElementById('jobsGrid');
    
    jobsGrid.innerHTML = '<div class="loading">Loading jobs...</div>';

    try {
        const response = await fetch(`http://localhost:3000/api/recruiter/${recruiterId}/jobs`);
        const data = await response.json();

        if (response.ok && data.jobs && data.jobs.length > 0) {
            const jobs = data.jobs;
            
            // Update stats
            document.getElementById('totalJobs').textContent = jobs.length;
            document.getElementById('activeJobs').textContent = jobs.filter(j => j.is_active).length;
            
            // Calculate total matches
            let totalMatches = 0;
            for (const job of jobs) {
                const matchesResponse = await fetch(`http://localhost:3000/api/job-posting/${job.id}/matches`);
                const matchesData = await matchesResponse.json();
                if (matchesResponse.ok) {
                    totalMatches += matchesData.totalMatches || 0;
                }
            }
            document.getElementById('totalMatches').textContent = totalMatches;

            // Display jobs
            jobsGrid.innerHTML = '';
            jobs.forEach(job => {
                const jobCard = createJobCard(job);
                jobsGrid.appendChild(jobCard);
            });

        } else {
            jobsGrid.innerHTML = '<div class="loading">No jobs posted yet. Click "Create New Job" to get started!</div>';
            document.getElementById('totalJobs').textContent = '0';
            document.getElementById('activeJobs').textContent = '0';
            document.getElementById('totalMatches').textContent = '0';
        }

    } catch (error) {
        console.error("Error loading jobs:", error);
        jobsGrid.innerHTML = '<div class="loading">Error loading jobs. Please refresh the page.</div>';
    }
}

// Function to create a job card
function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';
    
    const statusClass = job.is_active ? 'active' : 'inactive';
    const statusText = job.is_active ? 'Active' : 'Inactive';
    
    // Weight colors
    const weightColors = {
        education: '#3b82f6',
        experience: '#10b981',
        skills: '#f59e0b',
        projects: '#8b5cf6'
    };

    card.innerHTML = `
        <div class="job-header">
            <div>
                <div class="job-title">${job.job_post}</div>
                <div class="job-domain">${job.job_domain.toUpperCase()}</div>
            </div>
            <span class="job-status ${statusClass}">${statusText}</span>
        </div>

        <div class="job-weights">
            <h4>Weight Distribution</h4>
            <div class="weight-bar">
                <div class="weight-segment" style="width: ${job.weight_education}%; background: ${weightColors.education};"></div>
                <div class="weight-segment" style="width: ${job.weight_experience}%; background: ${weightColors.experience};"></div>
                <div class="weight-segment" style="width: ${job.weight_skills}%; background: ${weightColors.skills};"></div>
                <div class="weight-segment" style="width: ${job.weight_projects}%; background: ${weightColors.projects};"></div>
            </div>
            <div class="weight-legend">
                <div class="legend-item">
                    <span class="legend-color" style="background: ${weightColors.education};"></span>
                    <span>Education ${job.weight_education}%</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: ${weightColors.experience};"></span>
                    <span>Experience ${job.weight_experience}%</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: ${weightColors.skills};"></span>
                    <span>Skills ${job.weight_skills}%</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: ${weightColors.projects};"></span>
                    <span>Projects ${job.weight_projects}%</span>
                </div>
            </div>
        </div>

        <div class="job-meta">
            <span>📅 ${new Date(job.posted_date).toLocaleDateString()}</span>
            ${job.cgpa_threshold ? `<span>📊 Min CGPA: ${job.cgpa_threshold}</span>` : ''}
            ${job.experience_min_years ? `<span>⏱️ ${job.experience_min_years}-${job.experience_max_years} years</span>` : ''}
        </div>

        <div class="job-actions">
            <button class="btn btn-primary" onclick="findMatches(${job.id})">🔍 Find Matches</button>
            <button class="btn btn-secondary" onclick="viewMatches(${job.id})">👥 View Matches</button>
            <button class="btn btn-danger" onclick="deleteJob(${job.id})">🗑️ Delete</button>
        </div>
    `;

    return card;
}

// Function to find matches for a job
async function findMatches(jobId) {
    const confirmFind = confirm("This will search all candidates and calculate match scores. This may take a moment. Continue?");
    
    if (!confirmFind) return;

    try {
        // Show loading indicator
        const modal = document.getElementById('matchesModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modal.style.display = 'flex';
        modalTitle.textContent = 'Finding Matches...';
        modalBody.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">⏳ Analyzing candidates and calculating scores...</div>';

        const response = await fetch(`http://localhost:3000/api/job-posting/${jobId}/find-matches`, {
            method: 'POST'
        });

        const data = await response.json();

        if (response.ok) {
            modalTitle.textContent = `Top ${data.matches.length} Matches Found!`;
            
            if (data.matches.length === 0) {
                modalBody.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">No matching candidates found. Try adjusting your criteria.</div>';
            } else {
                displayMatches(data.matches);
            }

            // Reload jobs to update stats
            await loadJobs();

        } else {
            modalTitle.textContent = 'Error';
            modalBody.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--accent-red);">Error: ${data.message}</div>`;
        }

    } catch (error) {
        console.error("Error finding matches:", error);
        alert("Error finding matches. Please try again.");
    }
}

// Function to view existing matches
async function viewMatches(jobId) {
    const modal = document.getElementById('matchesModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modal.style.display = 'flex';
    modalTitle.textContent = 'Loading Matches...';
    modalBody.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">⏳ Loading...</div>';

    try {
        const response = await fetch(`http://localhost:3000/api/job-posting/${jobId}/matches`);
        const data = await response.json();

        if (response.ok) {
            if (data.totalMatches === 0) {
                modalTitle.textContent = 'No Matches Yet';
                modalBody.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">No matches found yet. Click "Find Matches" to search for candidates.</div>';
            } else {
                modalTitle.textContent = `Top ${data.totalMatches} Matches`;
                displayMatches(data.matches);
            }
        } else {
            modalTitle.textContent = 'Error';
            modalBody.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--accent-red);">Error: ${data.message}</div>`;
        }

    } catch (error) {
        console.error("Error viewing matches:", error);
        modalTitle.textContent = 'Error';
        modalBody.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--accent-red);">Error loading matches. Please try again.</div>';
    }
}

// Function to display matches in modal
function displayMatches(matches) {
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = '';
    
    matches.forEach((match, index) => {
        const matchCard = document.createElement('div');
        matchCard.className = 'match-card';
        
        matchCard.innerHTML = `
            <div style="display: flex; align-items: center; flex: 1;">
                <div class="match-rank">#${index + 1}</div>
                <div class="match-info">
                    <div class="match-name">${match.full_name}</div>
                    <div class="match-details">
                        <span>📧 ${match.email}</span>
                        <span>📍 ${match.city}, ${match.state}</span>
                        <span>🎓 ${match.qualification}</span>
                        ${match.cgpa ? `<span>📊 CGPA: ${match.cgpa}</span>` : ''}
                    </div>
                    ${match.current_company ? `<div style="margin-top: 8px; color: var(--text-muted); font-size: 0.9rem;">💼 ${match.current_designation} at ${match.current_company}</div>` : ''}
                </div>
            </div>
            <div class="match-scores">
                <div class="score-badge composite-score">
                    ${match.composite_score}/100
                </div>
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <div class="score-badge score-detail">📚 Edu: ${match.education_score}/10</div>
                    <div class="score-badge score-detail">💼 Exp: ${match.experience_score}/10</div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <div class="score-badge score-detail">🛠️ Skills: ${match.skills_score}/10</div>
                    <div class="score-badge score-detail">📁 Projects: ${match.projects_score}/10</div>
                </div>
            </div>
        `;
        
        modalBody.appendChild(matchCard);
    });
}

// Function to delete a job
async function deleteJob(jobId) {
    const confirmDelete = confirm("Are you sure you want to delete this job posting? This action cannot be undone.");
    
    if (!confirmDelete) return;

    try {
        const response = await fetch(`http://localhost:3000/api/job-posting/${jobId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            alert("Job posting deleted successfully!");
            await loadJobs(); // Reload the jobs list
        } else {
            alert(`Error: ${data.message}`);
        }

    } catch (error) {
        console.error("Error deleting job:", error);
        alert("Error deleting job. Please try again.");
    }
}