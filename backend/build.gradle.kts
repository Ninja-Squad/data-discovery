import org.asciidoctor.gradle.AsciidoctorTask
import org.gradle.api.tasks.testing.logging.TestExceptionFormat
import org.springframework.boot.gradle.tasks.buildinfo.BuildInfo
import org.springframework.boot.gradle.tasks.bundling.BootJar
import org.springframework.boot.gradle.tasks.run.BootRun

buildscript {
    repositories {
        mavenLocal()
        mavenCentral()
    }
}

plugins {
    java
    jacoco
    id("org.springframework.boot") version "2.5.1"
    id("com.gorylenko.gradle-git-properties") version "2.3.1"
    id("org.asciidoctor.convert") version "1.5.9.2"
    id("io.spring.dependency-management") version "1.0.11.RELEASE"
    id("org.sonarqube")
}


java {
    sourceCompatibility = JavaVersion.VERSION_1_8
}

repositories {
    mavenCentral()
}

extra["springCloudVersion"] = "2020.0.3"

val snippetsDir = file("build/generated-snippets")

tasks {

    withType(JavaCompile::class.java) {
        // make sur the parameter names are written in the byte code and available using reflection.
        // this is useful for Jackson and Spring to automatically deduce propert names or path variable names
        // based on the name of the parameter
        options.compilerArgs.add("-parameters")
    }

    getByName<Copy>("processResources") {
        inputs.property("app", project.app)

        filesMatching("bootstrap.yml") {
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

    // this task is always out-of-date because it generates a properties file with the build time inside
    // so the bootJar task is also always out of date, too, since it depends on it
    // but it's better to do that than using the bootInfo() method of the springBoot closure, because that
    // makes the test task out of date, which makes the build much longer.
    // See https://github.com/spring-projects/spring-boot/issues/13152
    val buildInfo by creating(BuildInfo::class) {
        destinationDir = file("$buildDir/buildInfo")
    }

    val bootJar by getting(BootJar::class) {
        archiveName = "${project.app}.jar"
        dependsOn(":frontend:assemble")
        dependsOn(buildInfo)

        into("BOOT-INF/classes/static") {
            from("${project(":frontend").projectDir}/dist/data-discovery-frontend")
        }
        into("BOOT-INF/classes/META-INF") {
            from(buildInfo.destinationDir)
        }
        launchScript()
    }

    val test by getting(Test::class) {
        useJUnitPlatform()
        testLogging {
            exceptionFormat = TestExceptionFormat.FULL
        }
        outputs.dir(snippetsDir)
    }

    val jacocoTestReport by getting(JacocoReport::class) {
        reports {
            xml.setEnabled(true)
            html.setEnabled(true)
        }
    }

    val asciidoctor by getting(AsciidoctorTask::class) {
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

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.cloud:spring-cloud-starter-config")
    implementation("org.springframework.cloud:spring-cloud-starter-bootstrap")
    implementation("org.springframework.boot:spring-boot-starter-data-elasticsearch")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.restdocs:spring-restdocs-mockmvc")

    asciidoctor("org.springframework.restdocs:spring-restdocs-asciidoctor:2.0.5.RELEASE")
}

