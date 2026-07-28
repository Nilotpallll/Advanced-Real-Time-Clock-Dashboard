# Real-Time Clock Dashboard

A responsive React + Vite dashboard for live world-clock monitoring with analog and digital clocks, timezone switching, alarms, and dynamic UI controls.

## Run locally

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
```

## Docker

Build and run with Docker:

```bash
docker build -t real-time-clock .
docker run -p 3000:80 real-time-clock
```

Or with Docker Compose:

```bash
docker-compose up --build
```

## Push to GitHub

If Git is installed locally, initialize and push the project with:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repository-url>
git push -u origin main
```
