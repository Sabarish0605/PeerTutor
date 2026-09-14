# 🐝 Hive — Peer Tutoring Platform

> A live, peer-to-peer tutoring marketplace where students discover tutors, enroll in live sessions, and learn together in real time.

[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://peer-tutor-alpha.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://hive-backend-gjvd.onrender.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#)

---

## 🌐 Live URLs

| Service  | URL |
|----------|-----|
| Frontend | https://peer-tutor-alpha.vercel.app |
| Backend API | https://hive-backend-gjvd.onrender.com/api |

---

## ✨ Features

### For Students
- 🔍 **Discover** courses across 8 CS categories (Software Development, AI & ML, Cloud & DevOps, etc.)
- 📅 **Enroll** in live scheduled sessions with real-time seat tracking
- 🧾 **My Learning** — track enrolled, ongoing, and completed sessions
- 🔔 **60-minute email + in-app reminders** before every class
- ⭐ **Review & Rate** tutors after sessions close
- 💸 **Escrow Refund** — automatic refund if a tutor abandons a scheduled session

### For Tutors
- 📚 **Course Management** — create, edit, and delete live courses with multiple time slots
- 🎥 **Session Controls** — go LIVE, close, and manage real-time class state
- 👥 **Subscriber Channel** — public profile page (YouTube-style) with subscriber count
- 🖼️ **Profile & Avatar** — upload and display profile pictures served via backend
- 💰 **Protected Pricing** — price and slot times are locked once students enroll

### Platform
- 🔐 **JWT Authentication** with OTP email verification on registration
- 📧 **SendGrid** email integration (OTP, reminders, refund notifications)
- 🛡️ **Security** — role-based access control, ownership gates on all mutations
- 📦 **Containerized** — Docker multi-stage build for production deployment

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | Core UI framework |
| Vite | 8 | Build tool & dev server |
| React Router | v7 | Client-side routing |
| Tailwind CSS | v4 | Utility-first styling |
| Axios | 1.x | HTTP client with JWT interceptors |
| Three.js + @react-three/fiber | 0.185 / 9.x | 3D landing page effects |
| GSAP | 3.x | Animations |
| Lucide React | 1.x | Icon library |
| React Hot Toast | 2.x | Toast notifications |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 21 LTS | Runtime |
| Spring Boot | 4.x | Application framework |
| Spring Security | 6.x | JWT auth & RBAC |
| Spring Data JPA + Hibernate | 6.x | ORM & database layer |
| MySQL Connector/J | 9.x | Database driver |
| JJWT | 0.11.5 | JWT token creation & validation |
| Lombok | latest | Boilerplate reduction |
| SendGrid Java SDK | via API | Transactional email |
| Maven | 3.9 | Build & dependency management |

### Database
| Technology | Purpose |
|------------|---------|
| MySQL 8.x | Primary relational database |

### DevOps & Deployment
| Technology | Purpose |
|------------|---------|
| Docker | Multi-stage container build |
| Vercel | Frontend hosting (SPA with rewrite rules) |
| Render | Backend hosting (Java Docker container) |
| GitHub | Source control & CI trigger |

---

## 📁 Project Structure

```
peertutor/
├── backend/                          # Spring Boot API
│   ├── src/main/java/com/peertutor/api/
│   │   ├── config/                   # CORS, Security, WebMvc config
│   │   ├── controller/               # REST controllers (Auth, Course, Booking, etc.)
│   │   ├── dto/                      # Request / Response DTOs
│   │   ├── entity/                   # JPA entities (User, Course, Booking, etc.)
│   │   ├── exception/                # Global exception handling
│   │   ├── repository/               # Spring Data JPA repositories
│   │   ├── scheduler/                # Background jobs (Escrow, Session lifecycle)
│   │   ├── security/                 # JWT filter, JwtService
│   │   └── service/                  # Business logic layer
│   ├── src/test/                     # JUnit 5 + Mockito unit tests (11 test classes)
│   ├── Dockerfile                    # Multi-stage Docker build (JDK 21 -> JRE Alpine)
│   └── pom.xml
│
├── frontend/                         # React + Vite SPA
│   ├── public/
│   │   ├── robots.txt               # SEO crawl rules
│   │   └── sitemap.xml              # Google sitemap
│   ├── src/
│   │   ├── components/              # Shared components (Navbar, DashboardLayout, etc.)
│   │   ├── context/                 # AuthContext (global user state)
│   │   ├── pages/                   # Route-level page components
│   │   │   ├── LandingPage.jsx      # 3D animated landing page
│   │   │   ├── Login.jsx / Register.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── TutorDashboard.jsx
│   │   │   ├── UserProfile.jsx      # Public tutor channel page
│   │   │   ├── MyLearning.jsx       # Student's enrolled courses
│   │   │   ├── Subscriptions.jsx    # Subscribed tutors feed
│   │   │   └── ProfileSettings.jsx  # Account settings
│   │   ├── services/
│   │   │   └── api.js               # Axios instance + getAvatarUrl helper
│   │   └── utils/
│   │       └── dateUtils.js         # Date formatting helpers
│   ├── vercel.json                  # SPA rewrite rules
│   └── index.html
│
└── README.md
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Java 21+
- Maven 3.9+
- MySQL 8.x running locally
- Node.js 20+
- A SendGrid account & API key

### 1. Clone the Repo
```bash
git clone https://github.com/Sabarish0605/PeerTutor.git
cd PeerTutor
```

### 2. Backend Setup
```bash
cd backend
```

Create `src/main/resources/application-local.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/peertutor?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
sendgrid.api.key=SG.YOUR_SENDGRID_KEY
sendgrid.from.email=your@email.com
```

Run the backend:
```bash
mvn spring-boot:run
```
API available at: `http://localhost:8080`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
App available at: `http://localhost:5173`

---

## 🐳 Docker (Backend)

```bash
cd backend
docker build -t hive-backend .
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL="jdbc:mysql://host.docker.internal:3306/peertutor?..." \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=yourpassword \
  -e SENDGRID_API_KEY=SG.yourkey \
  hive-backend
```

---

## 🌍 Environment Variables

### Backend (Render)
| Variable | Description |
|----------|-------------|
| `SPRING_DATASOURCE_URL` | MySQL JDBC connection string |
| `SPRING_DATASOURCE_USERNAME` | MySQL username |
| `SPRING_DATASOURCE_PASSWORD` | MySQL password |
| `SENDGRID_API_KEY` | SendGrid API key (starts with `SG.`) |
| `SENDGRID_FROM_EMAIL` | Verified sender email address |

### Frontend (Vercel — optional)
| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Override backend API URL (defaults to Render URL) |

---

## 🔗 Key API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | Public | Register (sends OTP) |
| `POST` | `/api/auth/verify-otp` | Public | Verify OTP, get JWT |
| `POST` | `/api/auth/login` | Public | Login, get JWT |
| `GET` | `/api/courses` | Public | List all courses |
| `POST` | `/api/courses/{userId}` | JWT | Create course |
| `PUT` | `/api/courses/{courseId}/{userId}` | JWT | Update course (owner only) |
| `DELETE`| `/api/courses/{courseId}/{userId}` | JWT | Delete course (owner only) |
| `POST` | `/api/bookings` | JWT | Enroll in a course slot |
| `POST` | `/api/slots/{slotId}/start` | JWT | Tutor starts session (LIVE) |
| `POST` | `/api/slots/{slotId}/close` | JWT | Tutor closes session |
| `POST` | `/api/upload` | JWT | Upload profile image |
| `GET` | `/uploads/{filename}` | Public | Serve uploaded files |
| `GET` | `/api/users/me` | JWT | Get current user profile |
| `PUT` | `/api/users/me` | JWT | Update profile |

---

## 🧪 Testing

The backend has **11 test classes** covering all critical business rules.
See [TEST_RESULTS.md](./TEST_RESULTS.md) for the full test report.

```bash
cd backend
mvn test
```

---

## 👨‍💻 Author

**Sabarish** — [@Sabarish0605](https://github.com/Sabarish0605)

---

## 📄 License

This project is licensed under the MIT License.
