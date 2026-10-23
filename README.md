# Campus_Care_Hack
# CampusCare 🎓

**CampusCare** is a web-based campus complaint management system that helps students report college-related problems and allows administrators to manage and track complaints efficiently.

## ✨ Features

- **Student Registration & Login** — Students can create accounts and log in securely.
- **Complaint Submission** — Submit complaints related to electricity, water, cleanliness, classrooms, laboratories, internet, hostels, and more.
- **Complaint Tracking** — Students can check the status of their submitted complaints.
- **Admin Dashboard** — Administrators can view and manage student complaints.
- **Complaint Status Management** — Track complaints through Pending, In Progress, and Resolved statuses.
- **Priority Selection** — Set complaint priority to Low, Medium, or High.
- **Responsive UI** — A clean interface designed for convenient use across different screen sizes.

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JSON Web Token (JWT) and bcryptjs

## 📁 Project Structure

```text
CampusCare/
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── api.js
│   │   └── app.js
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── admin-login.html
│   ├── dashboard.html
│   ├── admin-dashboard.html
│   └── complaint.html
├── models/
├── routes/
├── middleware