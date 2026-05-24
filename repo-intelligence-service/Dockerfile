FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY pom.xml ./
RUN mkdir -p src
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*
RUN mvn -B -q dependency:go-offline
COPY . .
RUN mvn -B -q package -DskipTests
EXPOSE 8085
CMD ["java", "-jar", "target/repo-intelligence-service-0.0.1-SNAPSHOT.jar"]
