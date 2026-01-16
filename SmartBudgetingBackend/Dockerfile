# --- Stage 1: Build the Application ---
# We use a Maven image to compile the code on the server
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
# This creates the 'target' folder and the .jar file
RUN mvn clean package -DskipTests

# --- Stage 2: Run the Application ---
# We use a lightweight Java image to actually run it
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# We copy the JAR *from* the build stage above
COPY --from=build /app/target/*.jar app.jar
# Standard Spring Boot port
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]