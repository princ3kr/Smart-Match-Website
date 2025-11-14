import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

// Database Configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    database: 'your_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('✅ Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
    });

// HTML ROUTES
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/home.html'));
});

app.get('/signup.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/signup.html'));
});

app.get('/details.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/details.html'));
});

app.get('/param.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/param.html'));
});

app.get('/employee_dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/employee_dashboard.html'));
});

app.get('/recruiter_signup.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/recruiter_signup.html'));
});

app.get('/recruiter_details.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/recruiter_details.html'));
});

app.get('/domain.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/domain.html'));
});

app.get('/recruiter.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/recruiter.html'));
});

app.get('/recruiter_dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/recruiter_dashboard.html'));
});

// EMPLOYEE REGISTRATION & AUTHENTICATION
app.post('/api/register/user', async (req, res) => {
    console.log('\n📝 Received request at /api/register/user');
    
    const { email, password, fullName, dob, phone, city, state } = req.body;

    if (!email || !password || !fullName || !dob || !phone || !city || !state) {
        return res.status(400).json({ message: 'Error: All fields are required.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const connection = await pool.getConnection();

        const sql = `
            INSERT INTO users (email, password_hash, full_name, dob, phone, city, state)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `;
        const values = [email, hashedPassword, fullName, dob, phone, city, state];

        const [result] = await connection.execute(sql, values);
        connection.release();

        const newUserId = result.insertId;
        console.log(`✅ User created successfully with ID: ${newUserId}`);

        res.status(201).json({ 
            message: 'User created successfully!',
            userId: newUserId 
        });

    } catch (error) {
        console.error('❌ Error in /api/register/user:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Error: This email is already registered.' });
        }
        
        res.status(500).json({ message: 'Error saving user to database.', error: error.message });
    }
});

app.post('/api/login/user', async (req, res) => {
    console.log('\n🔐 Employee login attempt');
    
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const connection = await pool.getConnection();
        
        const [users] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        connection.release();

        if (users.length === 0) {
            return res.status(404).json({ message: 'No account found with this email.' });
        }

        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Incorrect password.' });
        }

        console.log(`✅ User logged in: ${user.email}`);
        
        res.status(200).json({
            message: 'Login successful!',
            userId: user.id,
            email: user.email,
            fullName: user.full_name
        });

    } catch (error) {
        console.error('❌ Error in /api/login/user:', error);
        res.status(500).json({ message: 'Error during login.', error: error.message });
    }
});

app.post('/api/register/profile', async (req, res) => {
    console.log('\n📝 Received request at /api/register/profile');

    const { 
        userId, domain, qualification, cgpa, gradYear, 
        currentDesignation, currentCTC, currentCompany,
        courses, skills, projects 
    } = req.body;

    if (!userId || !domain || !qualification || !gradYear) {
        return res.status(400).json({ message: 'Error: userId, domain, qualification, and gradYear are required.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const profileSql = `
            INSERT INTO profiles 
            (user_id, domain, qualification, cgpa, grad_year, current_designation, current_company, current_ctc) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const profileValues = [
            userId, domain, qualification, cgpa || null, gradYear,
            currentDesignation || null, currentCompany || null, currentCTC || null
        ];
        
        const [profileResult] = await connection.execute(profileSql, profileValues);
        const newProfileId = profileResult.insertId;

        if (courses && courses.length > 0) {
            const courseSql = 'INSERT INTO courses (profile_id, course_name) VALUES ?;';
            const courseValues = courses.map(course => [newProfileId, course.name || course]);
            await connection.query(courseSql, [courseValues]);
        }

        if (skills && skills.length > 0) {
            const skillSql = 'INSERT INTO skills (profile_id, skill_name, years_experience) VALUES ?;';
            const skillValues = skills.map(skill => [
                newProfileId, 
                skill.name || skill.skill_name || skill, 
                skill.years || skill.years_experience || null
            ]);
            await connection.query(skillSql, [skillValues]);
        }

        if (projects && projects.length > 0) {
            const projectSql = 'INSERT INTO projects (profile_id, project_name, description, link) VALUES ?;';
            const projectValues = projects.map(proj => [
                newProfileId, 
                proj.name || proj.project_name, 
                proj.description || null, 
                proj.link || null
            ]);
            await connection.query(projectSql, [projectValues]);
        }
        
        await connection.commit();
        console.log(`✅ Profile created for user ID: ${userId}`);

        res.status(201).json({ 
            message: 'Profile created successfully!',
            profileId: newProfileId 
        });

    } catch (error) {
        console.error('❌ Error in /api/register/profile:', error);
        
        if (connection) {
            await connection.rollback();
        }
        
        res.status(500).json({ 
            message: 'Error saving profile to database.', 
            error: error.message
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

app.get('/api/user/profile/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const connection = await pool.getConnection();

        const [users] = await connection.execute(
            'SELECT id, email, full_name, dob, phone, city, state FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            connection.release();
            return res.status(404).json({ message: 'User not found.' });
        }

        const [profiles] = await connection.execute(
            'SELECT * FROM profiles WHERE user_id = ?',
            [userId]
        );

        let profileData = null;
        if (profiles.length > 0) {
            const profileId = profiles[0].id;

            const [courses] = await connection.execute(
                'SELECT course_name FROM courses WHERE profile_id = ?',
                [profileId]
            );

            const [skills] = await connection.execute(
                'SELECT skill_name, years_experience FROM skills WHERE profile_id = ?',
                [profileId]
            );

            const [projects] = await connection.execute(
                'SELECT project_name, description, link FROM projects WHERE profile_id = ?',
                [profileId]
            );

            profileData = {
                ...profiles[0],
                courses: courses.map(c => c.course_name),
                skills: skills,
                projects: projects
            };
        }

        connection.release();

        res.status(200).json({
            user: users[0],
            profile: profileData
        });

    } catch (error) {
        console.error('❌ Error fetching profile:', error);
        res.status(500).json({ message: 'Error fetching profile.', error: error.message });
    }
});

// RECRUITER REGISTRATION & AUTHENTICATION
app.post('/api/register/recruiter', async (req, res) => {
    console.log('\n📝 Received request at /api/register/recruiter');
    
    const { email, password, name, position, company, location, udyamFileName } = req.body;

    if (!email || !password || !name || !position || !company || !location) {
        return res.status(400).json({ message: 'Error: All fields are required.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const connection = await pool.getConnection();

        const sql = `
            INSERT INTO recruiters (email, password_hash, full_name, position, company_name, company_location, udyam_file_name)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `;
        const values = [email, hashedPassword, name, position, company, location, udyamFileName || null];

        const [result] = await connection.execute(sql, values);
        connection.release();

        const newRecruiterId = result.insertId;
        console.log(`✅ Recruiter created successfully with ID: ${newRecruiterId}`);

        res.status(201).json({ 
            message: 'Recruiter created successfully!',
            recruiterId: newRecruiterId 
        });

    } catch (error) {
        console.error('❌ Error in /api/register/recruiter:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Error: This email is already registered.' });
        }
        
        res.status(500).json({ message: 'Error saving recruiter to database.', error: error.message });
    }
});

app.post('/api/login/recruiter', async (req, res) => {
    console.log('\n🔐 Recruiter login attempt');
    
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const connection = await pool.getConnection();
        
        const [recruiters] = await connection.execute(
            'SELECT * FROM recruiters WHERE email = ?',
            [email]
        );
        
        connection.release();

        if (recruiters.length === 0) {
            return res.status(404).json({ message: 'No account found with this email.' });
        }

        const recruiter = recruiters[0];
        const passwordMatch = await bcrypt.compare(password, recruiter.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Incorrect password.' });
        }

        console.log(`✅ Recruiter logged in: ${recruiter.email}`);
        
        res.status(200).json({
            message: 'Login successful!',
            recruiterId: recruiter.id,
            email: recruiter.email,
            fullName: recruiter.full_name,
            company: recruiter.company_name
        });

    } catch (error) {
        console.error('❌ Error in /api/login/recruiter:', error);
        res.status(500).json({ message: 'Error during login.', error: error.message });
    }
});

// JOB POSTING APIs
// Create Job Posting with Weights
app.post('/api/recruiter/job-posting', async (req, res) => {
    console.log('\n📝 Creating new job posting with weights');
    
    const {
        recruiterId,
        jobDomain,
        jobPost,
        jobTitle,
        jobDescription,
        location,
        salaryRange,
        mainWeights,
        thresholds
    } = req.body;

    // Validation
    if (!recruiterId || !jobDomain || !jobPost || !mainWeights || !thresholds) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Validate weights sum to 100
    const weightsSum = mainWeights.education + mainWeights.experience + mainWeights.skills + mainWeights.projects;
    if (weightsSum !== 100) {
        return res.status(400).json({ message: `Weights must sum to 100. Current sum: ${weightsSum}` });
    }

    try {
        const connection = await pool.getConnection();

        const sql = `
            INSERT INTO job_postings (
                recruiter_id, job_domain, job_post, job_title, job_description,
                location, salary_range,
                weight_education, weight_experience, weight_skills, weight_projects,
                cgpa_threshold, qualification_threshold,
                experience_min_years, experience_max_years
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        const values = [
            recruiterId,
            jobDomain,
            jobPost,
            jobTitle || jobPost,
            jobDescription || null,
            location || null,
            salaryRange || null,
            mainWeights.education,
            mainWeights.experience,
            mainWeights.skills,
            mainWeights.projects,
            thresholds.education.cgpaMin || null,
            thresholds.education.qualificationMin || 'any',
            thresholds.experience.minYears || null,
            thresholds.experience.maxYears || null
        ];

        const [result] = await connection.execute(sql, values);
        connection.release();

        const jobId = result.insertId;
        console.log(`✅ Job posting created with ID: ${jobId}`);

        res.status(201).json({
            message: 'Job posting created successfully!',
            jobId: jobId
        });

    } catch (error) {
        console.error('❌ Error creating job posting:', error);
        res.status(500).json({ message: 'Error creating job posting.', error: error.message });
    }
});

// Get All Job Postings for a Recruiter
app.get('/api/recruiter/:recruiterId/jobs', async (req, res) => {
    const { recruiterId } = req.params;

    try {
        const connection = await pool.getConnection();

        const [jobs] = await connection.execute(
            `SELECT * FROM job_postings 
             WHERE recruiter_id = ? 
             ORDER BY posted_date DESC`,
            [recruiterId]
        );

        connection.release();

        res.status(200).json({ jobs });

    } catch (error) {
        console.error('❌ Error fetching jobs:', error);
        res.status(500).json({ message: 'Error fetching jobs.', error: error.message });
    }
});

// Get Single Job Posting Details
app.get('/api/job-posting/:jobId', async (req, res) => {
    const { jobId } = req.params;

    try {
        const connection = await pool.getConnection();

        const [jobs] = await connection.execute(
            'SELECT * FROM job_postings WHERE id = ?',
            [jobId]
        );

        if (jobs.length === 0) {
            connection.release();
            return res.status(404).json({ message: 'Job posting not found.' });
        }

        connection.release();

        res.status(200).json({ job: jobs[0] });

    } catch (error) {
        console.error('❌ Error fetching job:', error);
        res.status(500).json({ message: 'Error fetching job.', error: error.message });
    }
});

// MATCHING ALGORITHM
app.post('/api/job-posting/:jobId/find-matches', async (req, res) => {
    const { jobId } = req.params;
    console.log(`\n🔍 Finding matches for job ID: ${jobId}`);

    let connection;
    try {
        connection = await pool.getConnection();

        // 1. Get job posting details
        const [jobs] = await connection.execute(
            'SELECT * FROM job_postings WHERE id = ?',
            [jobId]
        );

        if (jobs.length === 0) {
            connection.release();
            return res.status(404).json({ message: 'Job posting not found.' });
        }

        const job = jobs[0];

        // 2. Get all candidates with profiles in the same domain
        const [candidates] = await connection.execute(`
            SELECT 
                u.id as user_id,
                u.full_name,
                u.email,
                u.city,
                u.state,
                p.*
            FROM users u
            INNER JOIN profiles p ON u.id = p.user_id
            WHERE p.domain = ?
        `, [job.job_domain]);

        console.log(`Found ${candidates.length} candidates in domain ${job.job_domain}`);

        // 3. Delete old matches for this job
        await connection.execute(
            'DELETE FROM candidate_matches WHERE job_posting_id = ?',
            [jobId]
        );

        // 4. Calculate scores for each candidate
        const matches = [];

        for (const candidate of candidates) {
            const scores = await calculateCandidateScore(connection, candidate, job);
            
            // Only include candidates with composite score > 0
            if (scores.compositeScore > 0) {
                matches.push({
                    userId: candidate.user_id,
                    fullName: candidate.full_name,
                    email: candidate.email,
                    location: `${candidate.city}, ${candidate.state}`,
                    ...scores
                });
            }
        }

        // 5. Sort by composite score and take top 50
        matches.sort((a, b) => b.compositeScore - a.compositeScore);
        const top50 = matches.slice(0, 50);

        // 6. Insert matches into database
        if (top50.length > 0) {
            const insertValues = top50.map((match, index) => [
                jobId,
                match.userId,
                match.educationScore,
                match.experienceScore,
                match.skillsScore,
                match.projectsScore,
                match.educationWeighted,
                match.experienceWeighted,
                match.skillsWeighted,
                match.projectsWeighted,
                match.compositeScore,
                index + 1 // rank
            ]);

            const insertSql = `
                INSERT INTO candidate_matches (
                    job_posting_id, user_id,
                    education_score, experience_score, skills_score, projects_score,
                    education_weighted, experience_weighted, skills_weighted, projects_weighted,
                    composite_score, match_rank
                ) VALUES ?
            `;

            await connection.query(insertSql, [insertValues]);
        }

        await connection.commit();
        connection.release();

        console.log(`✅ Found ${top50.length} top matches`);

        res.status(200).json({
            message: `Found ${top50.length} matching candidates`,
            totalCandidates: candidates.length,
            matches: top50
        });

    } catch (error) {
        console.error('❌ Error in matching algorithm:', error);
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        res.status(500).json({ message: 'Error finding matches.', error: error.message });
    }
});

// Helper function to calculate candidate score
async function calculateCandidateScore(connection, candidate, job) {
    let educationScore = 0;
    let experienceScore = 0;
    let skillsScore = 0;
    let projectsScore = 0;

    // CGPA Score
    if (job.cgpa_threshold && candidate.cgpa) {
        if (candidate.cgpa >= job.cgpa_threshold) {
            educationScore += 5; // Full points for meeting threshold
        } else {
            // Partial credit
            educationScore += (candidate.cgpa / job.cgpa_threshold) * 5;
        }
    } else if (candidate.cgpa) {
        // No threshold set, score based on CGPA out of 10
        educationScore += (candidate.cgpa / 10) * 5;
    }

    // Qualification Score
    const qualLevels = {
        'high-school': 1,
        'bachelors': 2,
        'masters': 3,
        'phd': 4
    };
    
    const candidateQualLevel = qualLevels[candidate.qualification] || 0;
    const thresholdQualLevel = qualLevels[job.qualification_threshold] || 0;

    if (job.qualification_threshold === 'any' || candidateQualLevel >= thresholdQualLevel) {
        educationScore += 5; // Full points
    } else if (candidateQualLevel > 0) {
        // Partial credit
        educationScore += (candidateQualLevel / thresholdQualLevel) * 5;
    }

    // Cap at 10
    educationScore = Math.min(educationScore, 10);

    // 2. EXPERIENCE SCORE (0-10)
    
    // Get candidate's experience in relevant roles
    const [skills] = await connection.execute(
        'SELECT skill_name, years_experience FROM skills WHERE profile_id = ?',
        [candidate.id]
    );

    // Get weight for the target job post
    const [postWeights] = await connection.execute(
        'SELECT weight_value FROM domain_post_weights WHERE domain = ? AND post_name = ?',
        [job.job_domain, job.job_post]
    );

    const targetPostWeight = postWeights.length > 0 ? postWeights[0].weight_value : 10;

    // Calculate experience score
    let maxExpScore = 0;
    
    for (const skill of skills) {
        const yearsExp = skill.years_experience || 0;
        
        // Check if skill matches target post (exact or partial match)
        const [skillWeight] = await connection.execute(
            'SELECT weight_value FROM domain_post_weights WHERE domain = ? AND post_name LIKE ?',
            [job.job_domain, `%${skill.skill_name}%`]
        );

        let skillScore = 0;
        
        if (skillWeight.length > 0) {
            // Skill matches a known post in the domain
            const weight = skillWeight[0].weight_value;
            
            if (job.experience_min_years && job.experience_max_years) {
                // Has range threshold
                if (yearsExp >= job.experience_min_years && yearsExp <= job.experience_max_years) {
                    skillScore = weight; // Full weight
                } else if (yearsExp < job.experience_min_years) {
                    // Less experience, partial credit
                    skillScore = (yearsExp / job.experience_min_years) * weight * 0.7;
                } else {
                    // More experience, slight deduction
                    const excess = yearsExp - job.experience_max_years;
                    skillScore = weight * Math.max(0.5, 1 - (excess * 0.05));
                }
            } else {
                // No threshold, score based on years
                skillScore = Math.min(yearsExp * 2, weight);
            }
        } else {
            // Skill not in top 10, fixed weight of 0.5
            skillScore = Math.min(yearsExp * 0.5, 0.5);
        }
        
        maxExpScore = Math.max(maxExpScore, skillScore);
    }

    experienceScore = Math.min(maxExpScore, 10);

    // 3. SKILLS SCORE (0-10)
    
    // Check skill hierarchy match
    const [hierarchySkills] = await connection.execute(
        `SELECT skill_name, weight_multiplier 
         FROM skill_hierarchy 
         WHERE domain = ?`,
        [job.job_domain]
    );

    let skillMatchScore = 0;
    let skillCount = 0;

    for (const candidateSkill of skills) {
        const matchingHierarchy = hierarchySkills.find(h => 
            candidateSkill.skill_name.toLowerCase().includes(h.skill_name.toLowerCase()) ||
            h.skill_name.toLowerCase().includes(candidateSkill.skill_name.toLowerCase())
        );

        if (matchingHierarchy) {
            skillMatchScore += matchingHierarchy.weight_multiplier * 2;
            skillCount++;
        }
    }

    // Get courses
    const [courses] = await connection.execute(
        'SELECT course_name FROM courses WHERE profile_id = ?',
        [candidate.id]
    );

    // Check if courses match domain
    for (const course of courses) {
        if (course.course_name.toLowerCase().includes(job.job_domain.split('-')[0].toLowerCase())) {
            skillMatchScore += 1;
            skillCount++;
        }
    }

    skillsScore = skillCount > 0 ? Math.min((skillMatchScore / skillCount) * 5, 10) : 0;

    // 4. PROJECTS SCORE (0-10)
    
    const [projects] = await connection.execute(
        'SELECT project_name, description FROM projects WHERE profile_id = ?',
        [candidate.id]
    );

    let projectScore = 0;
    
    if (projects.length > 0) {
        const domainKeywords = job.job_domain.split('-');
        const postKeywords = job.job_post.toLowerCase().split(' ');

        for (const project of projects) {
            const projectText = `${project.project_name} ${project.description || ''}`.toLowerCase();
            let relevanceScore = 0;

            // Check domain keywords
            for (const keyword of domainKeywords) {
                if (projectText.includes(keyword.toLowerCase())) {
                    relevanceScore += 2;
                }
            }

            // Check post keywords
            for (const keyword of postKeywords) {
                if (keyword.length > 3 && projectText.includes(keyword)) {
                    relevanceScore += 1;
                }
            }

            projectScore = Math.max(projectScore, relevanceScore);
        }

        projectsScore = Math.min(projectScore, 10);
    }

    // 5. CALCULATE WEIGHTED SCORES
    
    const educationWeighted = (educationScore * job.weight_education) / 10;
    const experienceWeighted = (experienceScore * job.weight_experience) / 10;
    const skillsWeighted = (skillsScore * job.weight_skills) / 10;
    const projectsWeighted = (projectsScore * job.weight_projects) / 10;

    const compositeScore = educationWeighted + experienceWeighted + skillsWeighted + projectsWeighted;

    return {
        educationScore: parseFloat(educationScore.toFixed(2)),
        experienceScore: parseFloat(experienceScore.toFixed(2)),
        skillsScore: parseFloat(skillsScore.toFixed(2)),
        projectsScore: parseFloat(projectsScore.toFixed(2)),
        educationWeighted: parseFloat(educationWeighted.toFixed(2)),
        experienceWeighted: parseFloat(experienceWeighted.toFixed(2)),
        skillsWeighted: parseFloat(skillsWeighted.toFixed(2)),
        projectsWeighted: parseFloat(projectsWeighted.toFixed(2)),
        compositeScore: parseFloat(compositeScore.toFixed(2))
    };
}

// Get Matches for a Job
app.get('/api/job-posting/:jobId/matches', async (req, res) => {
    const { jobId } = req.params;

    try {
        const connection = await pool.getConnection();

        const [matches] = await connection.execute(`
            SELECT 
                cm.*,
                u.full_name,
                u.email,
                u.phone,
                u.city,
                u.state,
                p.qualification,
                p.cgpa,
                p.current_company,
                p.current_designation
            FROM candidate_matches cm
            INNER JOIN users u ON cm.user_id = u.id
            INNER JOIN profiles p ON u.id = p.user_id
            WHERE cm.job_posting_id = ?
            ORDER BY cm.match_rank ASC
        `, [jobId]);

        connection.release();

        res.status(200).json({
            totalMatches: matches.length,
            matches: matches
        });

    } catch (error) {
        console.error('❌ Error fetching matches:', error);
        res.status(500).json({ message: 'Error fetching matches.', error: error.message });
    }
});

// UTILITY ENDPOINTS

// Get all available domains and posts
app.get('/api/domains-posts', async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [domainPosts] = await connection.execute(`
            SELECT domain, post_name, weight_value 
            FROM domain_post_weights 
            ORDER BY domain, weight_value DESC
        `);

        connection.release();

        // Group by domain
        const grouped = {};
        domainPosts.forEach(row => {
            if (!grouped[row.domain]) {
                grouped[row.domain] = [];
            }
            grouped[row.domain].push({
                postName: row.post_name,
                weight: row.weight_value
            });
        });

        res.status(200).json({ domains: grouped });

    } catch (error) {
        console.error('❌ Error fetching domains:', error);
        res.status(500).json({ message: 'Error fetching domains.', error: error.message });
    }
});

// Update Job Posting Status (Activate/Deactivate)
app.put('/api/job-posting/:jobId/status', async (req, res) => {
    const { jobId } = req.params;
    const { isActive } = req.body;

    try {
        const connection = await pool.getConnection();

        await connection.execute(
            'UPDATE job_postings SET is_active = ? WHERE id = ?',
            [isActive, jobId]
        );

        connection.release();

        res.status(200).json({ message: 'Job status updated successfully!' });

    } catch (error) {
        console.error('❌ Error updating job status:', error);
        res.status(500).json({ message: 'Error updating status.', error: error.message });
    }
});

// Delete Job Posting
app.delete('/api/job-posting/:jobId', async (req, res) => {
    const { jobId } = req.params;

    try {
        const connection = await pool.getConnection();

        await connection.execute(
            'DELETE FROM job_postings WHERE id = ?',
            [jobId]
        );

        connection.release();

        console.log(`✅ Job posting ${jobId} deleted`);

        res.status(200).json({ message: 'Job posting deleted successfully!' });

    } catch (error) {
        console.error('❌ Error deleting job:', error);
        res.status(500).json({ message: 'Error deleting job.', error: error.message });
    }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Backend server running on http://localhost:${PORT}`);
    console.log('✅ Homepage available at http://localhost:3000');
    console.log('📋 Employee flow: / → signup.html → details.html → param.html → dashboard');
    console.log('🏢 Recruiter flow: / → recruiter_signup.html → recruiter_details.html → domain.html → recruiter.html → recruiter_dashboard.html');
    console.log('⏳ Waiting for requests...\n');
});
