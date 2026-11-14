
# Etapa 1: Construcción del backend
FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

# Copiar Maven Wrapper y configuración
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Dar permisos de ejecución al Maven Wrapper
RUN chmod +x mvnw

# Descargar dependencias
RUN ./mvnw -B dependency:go-offline

# Copiar código fuente
COPY src ./src

# Construir aplicación
RUN ./mvnw -B clean package -DskipTests


# Etapa 2: Ejecución de la aplicación
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copiar el JAR generado
COPY --from=build /app/target/*.jar app.jar

# Puerto utilizado por Render
EXPOSE 8080

# Iniciar Spring Boot usando el puerto asignado por Render
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
