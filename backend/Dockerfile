# Build stage
# Using a Maven image that includes JDK 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
# Using WORKDIR / means pom.xml is at /pom.xml and src is at /src
WORKDIR /
COPY pom.xml .
# Optional: Download Maven dependencies first for better layer caching
# RUN mvn dependency:go-offline
COPY src ./src
# This will create the target directory at /target
RUN mvn clean package -DskipTests

# Run stage
# Using a slim OpenJDK 21 runtime image
FROM openjdk:21-slim
WORKDIR /
# Corrected path: Copy from the build stage's /target directory
COPY --from=build /target/*.jar app.jar
# Expose the port Spring Boot runs on (default 8080)
EXPOSE 8080
# Set default environment variables
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/tourny \
    SPRING_DATASOURCE_USERNAME=postgres \
    SPRING_DATASOURCE_PASSWORD=postgres \
    SPRING_JPA_HIBERNATE_DDL_AUTO=update \
    SPRING_JPA_SHOW_SQL=false
# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]