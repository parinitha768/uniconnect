# 🚀 UniConnect Deployment Guide

This document provides complete instructions for deploying the **UniConnect – Intelligent University Management Portal** across popular cloud platforms and production environments.

---

## ⚡ Architecture Summary

* **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS (Built into static assets in `frontend/dist`)
* **Backend**: Node.js + Express + Prisma ORM (Serves API routes at `/api/*` and production frontend static assets at `/`)
* **Database**: SQLite out-of-the-box (`backend/prisma/dev.db`) or MySQL 8.0 via `DATABASE_URL`
* **Port**: Runs on a **single port** (`process.env.PORT` or `5000`), eliminating CORS issues in production.

---

## Option 1: 🌐 1-Click Free Cloud Deployment on Render (Recommended)

Render provides free hosting for full-stack Node.js web services. The repository includes an automated blueprint: [`render.yaml`](file:///c:/Users/parinitha/Desktop/software/uniconnect/render.yaml).

### Steps:
1. **Push your code to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/uniconnect.git
   git branch -M main
   git push -u origin main
   ```
2. Go to **[render.com](https://render.com)** and sign in.
3. Click **New +** → **Blueprints**.
4. Connect your `uniconnect` repository.
5. Render reads `render.yaml` and automatically configures:
   * **Build Command**: `npm run install:all && npm run build && npm run postinstall && npm run db:push && npm run db:seed`
   * **Start Command**: `npm start`
   * **Environment Variables**: `NODE_ENV=production`, `JWT_SECRET`, `DATABASE_URL`
6. Click **Apply**. Within 3-4 minutes, your live production URL (e.g. `https://uniconnect-portal.onrender.com`) will be active.

---

## Option 2: 🚂 Railway Deployment

Railway supports automatic multi-container deployment (Full-Stack App + MySQL).

### Steps:
1. Push code to GitHub.
2. Go to **[railway.app](https://railway.app)** and click **New Project** → **Deploy from GitHub repo**.
3. Select `uniconnect`.
4. (Optional) Click **Add a Service** → **Database** → **MySQL** to attach a hosted MySQL database.
5. In Railway project settings, add the variable:
   * `DATABASE_URL`: `${{MySQL.DATABASE_URL}}` (or leave default for SQLite)
   * `JWT_SECRET`: `your-secure-random-secret`
6. Railway automatically uses the root [`Dockerfile`](file:///c:/Users/parinitha/Desktop/software/uniconnect/Dockerfile) to build and deploy.

---

## Option 3: 🐳 Docker & Docker Compose (Any VPS / Local Server)

The repository includes a production multi-stage [`Dockerfile`](file:///c:/Users/parinitha/Desktop/software/uniconnect/Dockerfile) and [`docker-compose.yml`](file:///c:/Users/parinitha/Desktop/software/uniconnect/docker-compose.yml) with preconfigured MySQL 8.0.

### Run with Docker Compose:
```bash
docker-compose up -d --build
```
* **App URL**: `http://localhost:5000`
* **MySQL Database**: Running on port `3306` with persistent storage.
* **Stop**: `docker-compose down`

---

## Option 4: ▲ Vercel (Frontend) + External Backend

If you prefer hosting the React frontend on Vercel:
1. Deploy the backend to Render/Railway to get a backend URL (e.g., `https://uniconnect-api.onrender.com`).
2. Go to **[vercel.com](https://vercel.com)**, import the repository.
3. Set the Environment Variable:
   * `VITE_API_URL`: `https://uniconnect-api.onrender.com/api`
4. Vercel uses [`vercel.json`](file:///c:/Users/parinitha/Desktop/software/uniconnect/vercel.json) to build and handle client-side routing.

---

## Option 5: 🖥️ Local / VM Production Server

To run the unified production build on any Windows, Linux, or macOS machine:

```bash
# 1. Install all dependencies
npm run install:all

# 2. Build both frontend and backend
npm run build

# 3. Generate Prisma client & seed database
npm run postinstall
npm run db:push
npm run db:seed

# 4. Start production server
npm start
```
The application will be live at **`http://localhost:5000`**.

