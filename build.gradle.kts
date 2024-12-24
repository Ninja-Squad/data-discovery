plugins {
    id("org.sonarqube") version "6.0.1.5171"
}

sonarqube {
    properties {
        property ("sonar.projectKey", "urgi-is_data-discovery_AXlG7GtvPgTGgvpuDgeV")
        property ("sonar.qualitygate.wait", false)
    }
}
