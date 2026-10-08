# Multi-stage Dockerfile for TryIt Cafe Backend (Root Repository Build Context)
# Build Stage
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace

# Cache dependencies
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build jar
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-privileged security user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create upload directory with proper permissions
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app

COPY --from=builder /workspace/target/*.jar app.jar
RUN chown appuser:appgroup app.jar

USER appuser

EXPOSE 8080

# JVM production tuning flags
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
