# Stage 1: Build frontend
FROM node:20-slim AS frontend
WORKDIR /frontend
COPY package.json package-lock.json* ./
RUN npm install
COPY index.html vite.config.ts tailwind.config.ts postcss.config.js tsconfig.json tsconfig.app.json tsconfig.node.json components.json ./
COPY src/ ./src/
RUN npm run build

# Stage 2: Python backend + built frontend
FROM python:3.12-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
COPY --from=frontend /frontend/dist ./static/

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
