# 🎯 SmartMatch - AI-Powered Recruitment Matching Engine

> **SynHack Hackathon Project** | Problem Statement by **Red String**

An intelligent recruitment platform that uses weighted scoring algorithms to match candidates with job postings, eliminating bias and improving hiring quality.

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-005C84?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat)](https://expressjs.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## 🚀 The Problem

Traditional recruitment systems rely on rigid filters (minimum CGPA, years of experience) that often reject qualified candidates who don't fit the exact criteria. This leads to:
- ❌ High-quality candidates being filtered out
- ❌ Biased hiring based on arbitrary thresholds
- ❌ One-size-fits-all approach that doesn't work for all roles

## 💡 Our Solution

**SmartMatch** gives recruiters control over what matters most for each role through a flexible weighting system:

- 🎚️ **Custom Weights**: Recruiters assign importance (%) to Education, Experience, Skills, and Projects
- 🧮 **Smart Scoring**: Candidates are scored 0-100 across all dimensions
- 🎯 **Intelligent Matching**: Algorithm finds top 50 matches based on weighted composite scores
- 📊 **Multi-dimensional Analysis**: Goes beyond keywords to understand skill hierarchies and domain expertise

---

## ✨ Key Features

### For Recruiters
- 📝 Create job postings with custom parameter weights (must sum to 100%)
- ⚖️ Set thresholds for CGPA, qualification, and experience ranges
- 🔍 Find matches with one click - algorithm processes 100+ profiles instantly
- 📈 View ranked candidates with detailed score breakdowns
- 🎯 Domain-specific matching (CSE/IT, ECE, EEE, Mechanical, MBA, CA)

### For Candidates
- 👤 Create comprehensive professional profiles
- 🎓 Add education, skills, courses, and projects dynamically
- 📍 Location-based profile with detailed work history
- 🔒 Secure authentication with bcrypt password hashing

### Matching Algorithm
```
Composite Score = (Education × W₁) + (Experience × W₂) + (Skills × W₃) + (Projects × W₄)

Where W₁ + W₂ + W₃ + W₄ = 100%
```

Each component is scored 0-10 based on:
- **Education**: CGPA vs threshold, qualification level matching
- **Experience**: Years in relevant roles, skill hierarchy matching
- **Skills**: Domain-specific skill trees, course relevance
- **Projects**: Keyword matching with job domain and role

---

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js
- MySQL with normalized schema (6+ tables)
- bcrypt for password hashing
- CORS enabled API

**Frontend:**
- Vanilla JavaScript (no frameworks)
- HTML5 + CSS3 (Modern UI with glassmorphism)
- Responsive design with mobile support

**Database Design:**
- Users, Profiles, Skills, Courses, Projects
- Recruiters, Job Postings, Candidate Matches
- Domain-Post Weights, Skill Hierarchy tables

---

## 📁 Project Structure

```
SmartMatch/
├── backend/
│   └── server.js              # Express server + API endpoints
├── frontend/
│   ├── html/
│   │   ├── home.html          # Landing page
│   │   ├── signup.html        # Employee registration
│   │   ├── details.html       # Personal details
│   │   ├── param.html         # Professional profile
│   │   ├── employee_dashboard.html
│   │   ├── recruiter_signup.html
│   │   ├── recruiter_details.html
│   │   ├── domain.html        # Job domain selection
│   │   ├── recruiter.html     # Weight configuration
│   │   └── recruiter_dashboard.html
│   ├── css/
│   │   ├── details.css
│   │   ├── param.css
│   │   ├── recruiter.css
│   │   ├── recruiter_dashboard.css
│   │   └── ... (other styles)
│   └── js/
│       ├── details.js
│       ├── param.js
│       ├── domain.js
│       ├── recruiter.js
│       ├── recruiter_dashboard.js
│       └── ... (other scripts)
└── database/
    ├── mysql1.sql             # Initial schema
    ├── mysql2.sql             # Matching system schema
    └── sampledata.sql         # 100 sample profiles
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/smartmatch.git
cd smartmatch
```

2. **Install dependencies**
```bash
cd backend
npm install
```

3. **Set up MySQL database**
```bash
mysql -u root -p
```
```sql
CREATE DATABASE user_profiles;
USE user_profiles;
SOURCE database/mysql1.sql;
SOURCE database/mysql2.sql;
SOURCE database/sampledata.sql;  -- Optional: 100 sample profiles
```

4. **Configure environment** (Optional but recommended)

Create `.env` file in backend directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_db
PORT=3000
```

Update `server.js`:
```javascript
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME || 'user_profiles',
};
```

5. **Start the server**
```bash
node server.js
```

6. **Open in browser**
```
http://localhost:3000
```

---

## 📊 Database Schema Highlights

### Key Tables

**users** - Employee authentication & personal info
```sql
id, email, password_hash, full_name, dob, phone, city, state
```

**profiles** - Professional information
```sql
user_id, domain, qualification, cgpa, grad_year, current_designation, current_company, current_ctc
```

**job_postings** - Recruiter job postings
```sql
recruiter_id, job_domain, job_post, weight_education, weight_experience, weight_skills, weight_projects, cgpa_threshold, experience_min_years, experience_max_years
```

**candidate_matches** - Calculated matches
```sql
job_posting_id, user_id, education_score, experience_score, skills_score, projects_score, composite_score, match_rank
```

**domain_post_weights** - Predefined weights for 60 job roles across 6 domains

**skill_hierarchy** - Skill tree for intelligent matching (e.g., React → Frontend → Web Development)

---

## 🎮 Usage Flow

### Employee Journey
1. **Sign Up** → Email & Password
2. **Personal Details** → Phone, DOB, Location
3. **Professional Profile** → Domain, CGPA, Skills (dynamic form)
4. **Dashboard** → View applications (coming soon)

### Recruiter Journey
1. **Sign Up** → Company details + UDYAM verification
2. **Select Domain** → Choose from 6 domains
3. **Select Job Role** → Pick from 10 roles per domain
4. **Configure Weights** → Assign importance (must sum to 100%)
5. **Set Thresholds** → CGPA, qualification, experience ranges
6. **Dashboard** → View/manage jobs, find matches

### Matching Process
```
Recruiter clicks "Find Matches"
    ↓
System fetches all candidates in same domain
    ↓
Calculate 4 scores (0-10) for each candidate
    ↓
Apply custom weights → Composite Score (0-100)
    ↓
Rank & return Top 50 matches
    ↓
Display with detailed breakdown
```

---

## 🧮 Matching Algorithm Details

### 1. Education Score (0-10)
- **CGPA Component (5 points)**: Full points if ≥ threshold, partial credit below
- **Qualification Component (5 points)**: Matches hierarchy (High School < Bachelor's < Master's < PhD)

### 2. Experience Score (0-10)
- Checks candidate's skill experience against domain-post weights
- **In-range experience**: Full weight (10.0 points)
- **Below range**: Partial credit (70% of weight)
- **Above range**: Slight deduction (5% per excess year)

### 3. Skills Score (0-10)
- Matches candidate skills against skill hierarchy tree
- Applies multipliers (1.0-1.2x) based on skill importance
- Considers related courses in the domain

### 4. Projects Score (0-10)
- Keyword matching with job domain and role
- Analyzes project names and descriptions
- Domain keywords: +2 points each
- Role keywords: +1 point each

### Final Calculation
```javascript
educationWeighted = (educationScore × weight_education) / 10
experienceWeighted = (experienceScore × weight_experience) / 10
skillsWeighted = (skillsScore × weight_skills) / 10
projectsWeighted = (projectsScore × weight_projects) / 10

compositeScore = educationWeighted + experienceWeighted + skillsWeighted + projectsWeighted
// Range: 0-100
```

---

## 📸 Screenshots

### Landing Page
*Modern glassmorphism design with role selection*

### Weight Configuration
*Recruiter dashboard showing slider-based weight assignment*

### Match Results
*Top 50 candidates with score breakdown and ranking*

---

## 🔐 Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ Parameterized SQL queries (prevents injection)
- ✅ CORS configuration
- ✅ Input validation on all forms
- ⚠️ **Note**: JWT authentication recommended for production

---

## 🚧 Known Limitations

1. **No JWT Authentication**: Sessions not maintained (uses localStorage)
2. **Database Password Exposed**: Should use environment variables
3. **No Rate Limiting**: Login endpoints vulnerable to brute force
4. **Basic Error Handling**: Could be more granular
5. **Static Skill Hierarchy**: Currently hardcoded for CSE/IT domain only

---

## 🔮 Future Enhancements

- [ ] JWT-based authentication system
- [ ] Real-time notifications for new matches
- [ ] Chat system between recruiters and candidates
- [ ] ML-based project relevance scoring (NLP)
- [ ] Resume parsing and auto-profile creation
- [ ] Expand skill hierarchies to all 6 domains
- [ ] Application tracking system
- [ ] Interview scheduling module
- [ ] Analytics dashboard for recruiters

---

## 🤝 Contributing

This was a hackathon project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source.

---

## 👥 Team

**Developer**: [Prince Kumar](www.linkedin.com/in/prince-kumar-364252332)

**Hackathon**: SynHack 2025
**Problem Statement By**: Red String

---

## 🙏 Acknowledgments

- **Red String** for the innovative problem statement
- **SynHack** organizers for the opportunity
- **MySQL** documentation for schema design insights
---

## 📧 Contact

For questions or feedback, reach out:
- LinkedIn: [Prince Kumar](www.linkedin.com/in/prince-kumar-364252332)
- Email: pk307339@gmail.com
- Project Link: [https://github.com/yourusername/smartmatch](https://github.com/princ3kr/Smart-Match-Website)

---

<div align="center">

**Built with ❤️ during SynHack 2024**

⭐ Star this repo if you found it interesting!

</div>
