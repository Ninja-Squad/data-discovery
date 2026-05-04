plugins {
    id("org.sonarqube") version "7.3.0.8198"
}

sonarqube {
    properties {
        property ("sonar.projectKey", "urgi-is_data-discovery_AXlG7GtvPgTGgvpuDgeV")
        property ("sonar.qualitygate.wait", false)
    }
}
