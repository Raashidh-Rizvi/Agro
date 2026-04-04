# AgriSense Lanka – Project Progress Tracker

## Project Duration

**8 Weeks**

## Project Goal

Build a full-stack mobile application for Sri Lankan farmers using:

- React Native (Expo)
- Node.js + Express.js
- MongoDB Atlas
- JWT Authentication
- 7 CRUD modules
- Hosted backend

---

# Phase 1 – Project Planning and Requirement Finalization

## Objective

Finalize the project idea, system scope, team structure, and technical plan before starting development.

## Main Tasks

- Finalize the project title: **AgriSense Lanka**
- Finalize the problem statement
- Finalize the 3 main user roles:
  - Farmer
  - Expert
  - Admin

- Finalize the 7 CRUD modules:
  - User (shared)
  - Crop
  - Diagnosis
  - Produce Listing
  - Expert Query
  - Advisory Alert
  - Market Price

- Finalize the technology stack
- Finalize the folder structure for backend and mobile app
- Create GitHub repository
- Create group communication channel
- Assign responsibilities to all 6 members

## Main Points That Must Be Completed

- [ ] Project title finalized
- [ ] Problem statement finalized
- [ ] Roles finalized
- [ ] All CRUD modules finalized
- [ ] Team responsibilities finalized
- [ ] GitHub repository created
- [ ] Basic folder planning completed

## Deliverables

- Agreed final project scope
- Team module ownership list
- Initial project structure plan

---

# Phase 2 – System Design and Documentation Planning

## Objective

Design the system before implementation so development becomes easier and cleaner.

## Main Tasks

- Design the high-level system architecture
- Design the database schema
- List all entities and fields
- Define module relationships
- Plan API endpoints
- Plan the frontend screens
- Start preparing documentation files required for submission

## Main Points That Must Be Completed

- [ ] System architecture diagram drafted
- [ ] Database schema diagram drafted
- [ ] API endpoint list drafted
- [ ] Screen list finalized
- [ ] Entity fields finalized
- [ ] Team responsibility document draft started

## Deliverables

- Architecture draft
- Database draft
- API planning draft
- Screen/module mapping

---

# Phase 3 – Project Setup and Environment Configuration

## Objective

Set up the backend, mobile app, database connection, and shared environment so the team can begin coding.

## Main Tasks

- Create the main project structure:
  - backend/
  - mobile/
  - docs/

- Initialize backend Node.js project
- Install backend dependencies
- Initialize React Native app using Expo
- Install mobile dependencies
- Set up MongoDB Atlas
- Create `.env` file
- Connect backend to MongoDB
- Create a simple test route
- Run backend successfully
- Run mobile app successfully

## Main Points That Must Be Completed

- [x] Backend project initialized
- [x] Mobile project initialized
- [x] MongoDB Atlas created and connected
- [x] `.env` file configured
- [x] Backend runs without errors
- [x] Mobile app runs without errors
- [x] GitHub repo has initial project structure pushed

## Deliverables

- Running backend
- Running mobile app
- Working MongoDB connection

---

# Phase 4 – Shared Authentication and User Management

## Objective

Build the mandatory authentication system first because all other modules depend on logged-in users.

## Main Tasks

- Create User model
- Create register API
- Create login API
- Hash passwords using bcrypt
- Generate JWT tokens
- Create authentication middleware
- Create protected routes
- Create role-based access logic
- Build Register screen
- Build Login screen
- Build Profile screen
- Test authentication flow using Postman and mobile app

## Main Points That Must Be Completed

- [ ] User model created
- [ ] Register API works
- [ ] Login API works
- [ ] Password hashing works
- [ ] JWT generation works
- [ ] Protected route middleware works
- [ ] Login screen works
- [ ] Register screen works
- [ ] Token is stored and sent correctly from mobile app

## Deliverables

- Full shared authentication system
- User registration/login flow
- Protected route foundation for all modules

---

# Phase 5 – Core CRUD Module Development

## Objective

Develop the main CRUD modules for the application.

## Main Tasks

### Member 1 – Crop Management

- Create Crop model
- Build crop CRUD APIs
- Build crop screens

### Member 2 – Diagnosis Management

- Create Diagnosis model
- Build diagnosis CRUD APIs
- Build diagnosis history screens

### Member 3 – Produce Listing Management

- Create ProduceListing model
- Build produce CRUD APIs
- Build produce listing screens

### Member 4 – Expert Query Management

- Create ExpertQuery model
- Build expert query CRUD APIs
- Build question/reply screens

### Member 5 – Advisory Alert Management

- Create AdvisoryAlert model
- Build advisory CRUD APIs
- Build alert screens

### Member 6 – Market Price Management

- Create MarketPrice model
- Build market price CRUD APIs
- Build price management screens

## Main Points That Must Be Completed

- [ ] All 6 module models created
- [ ] All CRUD routes created
- [ ] All CRUD controllers created
- [ ] Validation added for all modules
- [ ] Frontend screens created for each module
- [ ] API integration started for each module
- [ ] Postman testing done for each module

## Deliverables

- All 7 entities created
- Main CRUD structure ready
- Frontend and backend linked for each module

---

# Phase 6 – AI Integration and Image Upload

## Objective

Implement the smart feature of the system in a simple beginner-friendly way.

## Main Tasks

- Set up image upload using Multer or Cloudinary
- Create image upload route
- Connect diagnosis module to image upload
- Integrate simple disease detection logic
- Use a pretrained model or external API if available
- Store disease result in Diagnosis collection
- Show diagnosis result in frontend
- Show diagnosis history to user

## Main Points That Must Be Completed

- [ ] Image upload works
- [ ] Image validation works
- [ ] Diagnosis result is stored in database
- [ ] Frontend shows uploaded image result
- [ ] Disease history can be viewed
- [ ] AI feature is connected to diagnosis flow

## Deliverables

- Working image-based diagnosis feature
- Stored diagnosis records
- AI-related module ready for demo

---

# Phase 7 – Integration, Testing, and Refinement

## Objective

Make all modules work together properly and improve quality before deployment.

## Main Tasks

- Connect all screens to backend APIs
- Fix broken routes and integration issues
- Test authentication with all modules
- Test CRUD operations for each module
- Test image upload flow
- Add loading states and error handling
- Improve UI consistency
- Add navigation between all major screens
- Ensure role-based restrictions work properly

## Main Points That Must Be Completed

- [ ] All modules connected to live backend
- [ ] CRUD operations tested end-to-end
- [ ] Navigation works correctly
- [ ] Loading and error states added
- [ ] Validation works on frontend and backend
- [ ] Role-based access works correctly
- [ ] No major integration bugs remain

## Deliverables

- Fully integrated application
- Stable working version for deployment
- Cleaner and more usable UI

---

# Phase 8 – Deployment, Documentation, and Final Submission

## Objective

Deploy the backend, finalize documentation, and prepare for demo and viva.

## Main Tasks

- Deploy backend online using Render / Railway / similar
- Connect mobile app to hosted backend
- Test deployed API endpoints
- Finalize README
- Finalize Problem Statement
- Finalize System Architecture Diagram
- Finalize Database Schema Diagram
- Finalize API Endpoint Table
- Finalize Team Responsibility document
- Prepare final ZIP with documentation only
- Prepare viva explanation for each member
- Practice final presentation/demo

## Main Points That Must Be Completed

- [ ] Backend deployed online
- [ ] Mobile app connected to hosted backend
- [ ] GitHub repository updated and clean
- [ ] README completed
- [ ] Problem statement completed
- [ ] Architecture diagram completed
- [ ] Database schema diagram completed
- [ ] API endpoint table completed
- [ ] Team responsibility document completed
- [ ] Submission ZIP contains documentation only
- [ ] All members prepared for viva

## Deliverables

- Hosted backend
- Final documentation package
- Final demo-ready application
- Viva-ready team

---

# Overall Project Completion Checklist

## Shared System

- [ ] Authentication completed
- [ ] JWT completed
- [ ] Protected routes completed
- [ ] Role-based access completed
- [ ] Backend deployed

## CRUD Modules

- [ ] Crop CRUD completed
- [ ] Diagnosis CRUD completed
- [ ] Produce Listing CRUD completed
- [ ] Expert Query CRUD completed
- [ ] Advisory Alert CRUD completed
- [ ] Market Price CRUD completed
- [ ] User management completed

## AI and Upload

- [ ] Image upload completed
- [ ] Disease detection flow completed
- [ ] Diagnosis history completed

## Frontend

- [ ] Login/Register screens completed
- [ ] All module screens completed
- [ ] Navigation completed
- [ ] API integration completed

## Documentation

- [ ] Problem Statement completed
- [ ] Architecture Diagram completed
- [ ] Database Schema completed
- [ ] API Endpoint Table completed
- [ ] Team Responsibility completed
- [ ] README completed

## Submission

- [ ] GitHub link added
- [ ] Backend URL added
- [ ] ZIP prepared correctly
- [ ] Final review completed

---

# Notes Section

## Problems Faced

-
-
-

## Fixes Applied

-
-
-

## Pending Work

-
-
-

## Final Remarks

This progress tracker is used to monitor the development of AgriSense Lanka phase by phase and ensure that all required system components, documentation, and deployment tasks are completed on time.
