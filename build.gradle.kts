plugins {
    id("org.sonarqube") version "5.1.0.4882"
}

sonarqube {
    properties {
        property ("sonar.projectKey", "urgi-is_data-discovery_AXlG7GtvPgTGgvpuDgeV")
        property ("sonar.qualitygate.wait", false)
    }
}
