# Build Stage (Java 21)
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy configuration and source
COPY pom.xml .
COPY src ./src

# Build the JAR, skipping tests to conserve resources
RUN mvn clean package -DskipTests

# Run Stage (Lightweight JRE 21)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built jar from build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# Keep memory constrained within Render free tier limits (512MB limit)
ENTRYPOINT ["java", "-Xmx350m", "-Xms256m", "-jar", "app.jar"]