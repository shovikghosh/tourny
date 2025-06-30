# Build frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Build backend
FROM maven:3.9.6-eclipse-temurin-21 AS backend-build
WORKDIR /app/backend
COPY backend/pom.xml .
RUN mvn dependency:go-offline
COPY backend/ .
RUN mvn clean package -DskipTests

# Final stage
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

# Install Node.js and PostgreSQL client
RUN apk add --no-cache nodejs npm postgresql-client

# Copy backend
COPY --from=backend-build /app/backend/target/*.jar app.jar

# Copy frontend
COPY --from=frontend-build /app/frontend/.next /app/frontend/.next
COPY --from=frontend-build /app/frontend/public /app/frontend/public
COPY --from=frontend-build /app/frontend/package*.json /app/frontend/

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install --production

# Set environment variables
ENV SPRING_PROFILES_ACTIVE=prod
ENV PORT=8080

# Expose port
EXPOSE 8080

# Copy wait-for-it script to wait for PostgreSQL
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Start both applications
WORKDIR /app
COPY start.sh .
RUN chmod +x start.sh
CMD ["/wait-for-it.sh", "db:5432", "--", "./start.sh"] 
