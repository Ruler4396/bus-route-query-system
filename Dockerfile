# 多阶段构建 - Maven构建阶段
FROM maven:3.8-eclipse-temurin-8 AS builder

WORKDIR /app

# 复制pom.xml并下载依赖（利用Docker缓存层）
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 复制源代码并构建
COPY src ./src
RUN mvn clean package -DskipTests -B

# 运行阶段 - 使用更小的镜像
FROM eclipse-temurin:8-jre-alpine

WORKDIR /app

# 复制构建好的jar文件
COPY --from=builder /app/target/*.jar app.jar

# 暴露端口
EXPOSE 8080

# 设置时区为上海
ENV TZ=Asia/Shanghai

# 启动应用
ENTRYPOINT ["java", "-jar", "app.jar"]
