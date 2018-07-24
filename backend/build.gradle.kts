import org.springframework.boot.gradle.tasks.buildinfo.BuildInfo
import org.springframework.boot.gradle.tasks.bundling.BootJar
import org.springframework.boot.gradle.tasks.run.BootRun

buildscript {
    repositories {
        mavenCentral()
    }
}

plugins {
    java
    jacoco
    id("org.springframework.boot") version "2.0.3.RELEASE"
    id("com.gorylenko.gradle-git-properties") version "1.4.21"
}

apply(plugin = "io.spring.dependency-management")

java {
    sourceCompatibility = JavaVersion.VERSION_1_8
}

repositories {
    mavenCentral()
    maven("https://repo.spring.io/libs-milestone")
}

tasks {

    withType(JavaCompile::class.java) {
        // make sur the parameter names are writtn in the byte code and available using reflection.
        // this is useful for Jackson and Spring to automatically deduce propert names or path variable names
        // based on the name of the parameter
        options.compilerArgs.add("-parameters")
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
        archiveName = "rare.jar"
        dependsOn(":frontend:assemble")
        dependsOn(buildInfo)

        into("BOOT-INF/classes/static") {
            from("${project(":frontend").projectDir}/dist/rare-frontend")
        }
        into("BOOT-INF/classes/META-INF") {
            from(buildInfo.destinationDir)
        }
    }

    val test by getting(Test::class) {
        useJUnitPlatform()
    }

    val jacocoTestReport by getting(JacocoReport::class) {
        reports {
            xml.setEnabled(true)
            html.setEnabled(true)
        }
    }
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    implementation("org.springframework.data:spring-data-elasticsearch:3.1.0.M3")
    implementation("org.elasticsearch:elasticsearch:6.3.1")
    implementation("org.elasticsearch.client:transport:6.3.1")
    implementation("org.elasticsearch.plugin:transport-netty4-client:6.3.1")

    testImplementation("org.springframework.boot:spring-boot-starter-test") {
        exclude(module = "junit")
    }

    testImplementation("org.junit.jupiter:junit-jupiter-api")
    testImplementation("org.mockito:mockito-junit-jupiter:2.19.1")
    testImplementation("org.junit-pioneer:junit-pioneer:0.1.2")
    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine")
}
