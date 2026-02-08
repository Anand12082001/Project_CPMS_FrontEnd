# College Placement Management System

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [User Roles](#user-roles)



## Introduction
The **College Placement Management System** is a web application designed to streamline and digitize the placement process in colleges and universities.  the system features a multi-role platform catering to students, TPO (Training and Placement Officer), and super admin. It aims to minimize manual efforts, improve transparency, and provide real-time tracking of the placement cycle.


## User Roles
- **Students**: View and apply for jobs, update profile, track status, and upload resumes.
- **TPO Admin**: Post jobs, manage applications, and schedule interviews.
- 
- **Super Admin**: Manage system settings, and create/manage TPO and Management users.
.

## Features
- **Student Portal**: Register and login, update profile, upload resume, view available job opportunities, apply for jobs, and track      fd  application status

🎓 Student Portal     
-------------------------
.Secure registration & login

.Placement profile management

.Resume upload (Cloudinary)

.View & apply for job openings

.View applied jobs list

.Track application & interview status

.View interview details (mode, date, link/address)

.Real-time status updates from TPO


- **TPO Admin Portal**: Post and manage job listings, approve/reject student applications, schedule interviews

🏢 TPO (Training & Placement Officer) Portal
------------------------------------------------
.Post and manage job listings

.View all applicants per job

.Advanced applicant table with:

.Search

.Filter by year & status

.Highlighted search matches

.Schedule interviews (online / offline)

.Update interview rounds & results

.Update final job status (Interview / Hired / Rejected / On Hold)

.View placement analytics & charts

.Track interview-to-hire conversion

- **Super Admin Portal**: Full control of the system including onboarding TPOs users, managing system configurations.


- **Cloudinary Integration**: Handles secure storage of profile pictures, resumes, and offer letters.

## Tech Stack
- **Frontend**: Vite + React.js, Tailwind CSS, Bootstrap
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **File Storage**: Cloudinary
- **Styling**: Tailwind CSS, Bootstrap



📊** Advanced Features **(NEW)

📈 Reports & Analytics (TPO View)
------------------------------------
.Interview vs Hired Ratio (Pie Chart)

.Real-time chart updates based on applicant status

.Placement outcome visualization per job

.Helps analyze interview effectiveness

📊 Application Tracking System
---------------------------------
.Centralized Application Collection

.Tracks:

.Applied date

.Interview rounds

.Interview mode (Online / Offline)

.Interview time & link/address

.Final selection status

.Fully synced between Student & TPO views

⏳ Interview Status Indicators
------------------------------

.“Interview not scheduled yet” banner for students

.Dynamic interview instructions:

.Online → Join link at scheduled time

.Offline → Address & timing displayed

☁ Cloudinary Integration
-------------------------
.Secure upload for:

.Resumes

.Offer letters

.Documents

