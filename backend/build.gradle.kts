import org.gradle.api.tasks.testing.logging.TestExceptionFormat
import org.springframework.boot.gradle.tasks.buildinfo.BuildInfo

buildscript {
    repositories {
        mavenCentral()
    }
}

plugins {
    java
    jacoco
    id("org.springframework.boot") version "3.1.5"
    id("com.gorylenko.gradle-git-properties") version "2.4.1"
    id("org.asciidoctor.jvm.convert") version "3.3.2"
    id("io.spring.dependency-management") version "1.1.4"
    id("org.sonarqube")
}


java {
    sourceCompatibility = JavaVersion.VERSION_17
}

repositories {
    mavenCentral()
}

extra["springCloudVersion"] = "2022.0.4"

val snippetsDir = file("build/generated-snippets")

tasks {

    withType(JavaCompile::class.java) {
        // make sur the parameter names are written in the byte code and available using reflection.
        // this is useful for Jackson and Spring to automatically deduce propert names or path variable names
        // based on the name of the parameter
        options.compilerArgs.add("-parameters")
    }

    // this task is always out-of-date because it generates a properties file with the build time inside
    // so the bootJar task is also always out of date, too, since it depends on it
    // but it's better to do that than using the bootInfo() method of the springBoot closure, because that
    // makes the test task out of date, which makes the build much longer.
    // See https://github.com/spring-projects/spring-boot/issues/13152
    val buildInfo by registering(BuildInfo::class) {
        destinationDir.set(file("$buildDir/buildInfo"))
    }

    processResources {
        inputs.property("app", project.app)

        filesMatching("application.yml") {
            filter {
                if (it.trim().startsWith("active:")) {
                    it.replace("rare", project.app)
                }
                else {
                    it
                }
            }
        }
    }

    bootJar {
        archiveFileName.set("${project.app}.jar")
        dependsOn(":frontend:assemble")
        dependsOn(buildInfo)

        into("BOOT-INF/classes/static") {
            from("${project(":frontend").projectDir}/dist/data-discovery-frontend/browser")
        }
        into("BOOT-INF/classes/META-INF") {
            from(buildInfo.map { it.destinationDir })
        }
        launchScript()
    }

    bootRun {
        jvmArgs("-Dspring.profiles.active=${project.app}-app")
    }

    test {
        useJUnitPlatform()
        testLogging {
            exceptionFormat = TestExceptionFormat.FULL
        }
        outputs.dir(snippetsDir)
    }

    jacocoTestReport {
        reports {
            xml.required.set(true)
            html.required.set(true)
        }
    }

    asciidoctor {
        configurations("asciidoctorExt")
        inputs.dir(snippetsDir)
        dependsOn(test)
        sourceDir("src/main/asciidoc")
    }
}

dependencyManagement {
    imports {
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:${property("springCloudVersion")}")
    }
}

configurations.create("asciidoctorExt")

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    implementation("org.springframework.cloud:spring-cloud-starter-config")
    implementation("org.springframework.boot:spring-boot-starter-data-elasticsearch")
    implementation("com.github.ben-manes.caffeine:caffeine")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.restdocs:spring-restdocs-mockmvc")
    testImplementation("com.squareup.okhttp3:mockwebserver")

    "asciidoctorExt"("org.springframework.restdocs:spring-restdocs-asciidoctor")
}

