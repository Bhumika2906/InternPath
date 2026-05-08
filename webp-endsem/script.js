let applications = []; 
let currentRole = null;
let currentUserEmail = null;

// recruiter email
const RECRUITER_EMAIL = 'recruiter@internpath.com';

// backend server url
const API_URL = 'http://localhost:3000/api/applications'; //frontend sends and receive data

// init
document.addEventListener('DOMContentLoaded', async () => {
    await fetchApplications(); 
    await renderInternships();
});

// application fetch
async function fetchApplications() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

         
        if (Array.isArray(data)) {
            applications = data;
        } else {
            console.error("Server error or invalid data format:", data);
            applications = []; // keep it as an empty array if server fails
        }

        renderUserApplications();
        renderAdminApplications();
    } catch (err) {
        console.error("could not fetch data from server", err);
        applications = []; // default to empty array on network error
    }
}

// save new application to server
async function saveApplication(newApp) {
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp)
    });
    fetchApplications();
}

// Update status
async function updateStatusOnServer(appId, newStatus) {
    await fetch(`${API_URL}/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    });
    fetchApplications();
}



function selectRole(role) {
    if (role === 'student') {
        const emailInput = document.getElementById('login-email').value;
        if (!emailInput) {
            alert("Please enter your email to continue.");
            return;
        }
        if (!emailInput.includes('@')) {
            alert("Please enter a valid email");
            return;
        }
        currentUserEmail = emailInput;
    } else if (role === 'recruiter') {
        const emailInput = document.getElementById('recruiter-email').value;
        if (!emailInput) {
            alert("Please enter recruiter email to continue.");
            return;
        }
        if (emailInput !== RECRUITER_EMAIL) {
            alert("Unauthorized: Invalid recruiter email.");
            return;
        }
        currentUserEmail = emailInput;
    }

    currentRole = role;
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'grid';

    const adminNav = document.getElementById('nav-admin');
    const myAppsNav = document.getElementById('nav-my-applications');

    if (role === 'student') {
        adminNav.style.display = 'none';
        myAppsNav.style.display = 'block';
        showSection('job-board');
    } else {
        adminNav.style.display = 'block';
        myAppsNav.style.display = 'none';
        showSection('admin');
    }
    renderUserApplications();
    renderInternships();
}

function logout() {
    currentRole = null;
    currentUserEmail = '';
    document.getElementById('login-email').value = '';
    document.getElementById('recruiter-email').value = '';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    document.querySelectorAll('nav li').forEach(li => li.classList.remove('active'));
    const navItem = document.getElementById(`nav-${sectionId}`);
    if (navItem) navItem.classList.add('active');
}

// internships list
const internships = [
    { id: 1, title: "Frontend Developer Intern", company: "Wipro", location: "Remote", type: "Full-time", description: "Looking for a UI/UX focused developer." },
    { id: 2, title: "Marketing & Sales Intern", company: "TCS", location: "New York", type: "Part-time", description: "Learn about digital marketing." },
    { id: 3, title: "Data Science Intern", company: "Infosys", location: "Hybrid", type: "Full-time", description: "Work with big data sets." }
];

function renderInternships() {
    const list = document.getElementById('internship-list');
    list.innerHTML = internships.map(job => `
        <div class="card">
            <div class="company">${job.company}</div>
            <h3>${job.title}</h3>
            <p style="color: #64748b; font-size: 0.875rem; margin-bottom: 1.5rem;">
                ${currentRole === 'student' ? job.description : `<b>Type:</b> ${job.type} | <b>Location:</b> ${job.location}`}
            </p>
            ${currentRole === 'student' ? `<button class="btn btn-primary" onclick="openApplyModal(${job.id})">Apply Now</button>` : ''}
        </div>
    `).join('');
}

function openApplyModal(id) {
    const job = internships.find(j => j.id === id);
    document.getElementById('internship-id').value = job.id;
    document.getElementById('modal-title').innerText = `Apply for ${job.title}`;
    document.getElementById('modal-company').innerText = job.company;
    document.getElementById('student-email').value = currentUserEmail;
    document.getElementById('apply-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('apply-modal').style.display = 'none';
    document.getElementById('application-form').reset();
}

document.getElementById('application-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const internshipId = parseInt(document.getElementById('internship-id').value);
    const internship = internships.find(j => j.id === internshipId);

    const studentName = document.getElementById('student-name').value.trim();
    const studentEmail = document.getElementById('student-email').value.trim().toLowerCase();

    const nameRegex = /^[A-Za-z ]{2,50}$/;

    if (!nameRegex.test(studentName)) {
        alert('Please enter a valid name.');
        return;
    }

    if (!studentEmail.includes('@')) {
        alert('Please enter a valid email.');
        return;
    }

    const newApplication = {
        appId: Date.now(),
        internshipId: internshipId,
        jobTitle: internship.title,
        company: internship.company,
        studentName: studentName,
        studentEmail: studentEmail,
        appliedDate: new Date().toLocaleDateString(),
        status: 'applied'
    };

    await saveApplication(newApplication);
    closeModal();
    alert('Application submitted!');
    showSection('my-applications');
});

function renderUserApplications() { // my application tab data
    const tbody = document.getElementById('applications-table-body');
    const myApps = applications.filter(app => app.studentEmail === currentUserEmail);
    if (myApps.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No applications found.</td></tr>';
        return;
    }
    tbody.innerHTML = myApps.map(app => `
        <tr>
            <td style="font-weight: 600;">${app.jobTitle}</td>
            <td>${app.company}</td>
            <td>${app.appliedDate}</td>
            <td><span class="status-badge status-${app.status}">${app.status}</span></td>
        </tr>
    `).join('');
}

// recruiter view list
function renderAdminApplications() {
    const tbody = document.getElementById('admin-table-body');
    if (applications.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No applications.</td></tr>';
        return;
    }
    tbody.innerHTML = applications.map(app => `
        <tr>
            <td><b>${app.studentName}</b><br>${app.studentEmail}</td>
            <td>${app.jobTitle}</td>
            <td>${app.appliedDate}</td>
            <td>
                <select onchange="updateStatusOnServer(${app.appId}, this.value)">
                    <option value="applied" ${app.status === 'applied' ? 'selected' : ''}>Applied</option>
                    <option value="shortlisted" ${app.status === 'shortlisted' ? 'selected' : ''}>Shortlisted</option>
                    <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                </select>
            </td>
        </tr>
    `).join('');
}

window.onclick = function (event) {
    if (event.target == document.getElementById('apply-modal')) closeModal();
}
