plugins {
    id("org.sonarqube") version "6.2.0.5505"
}

sonarqube {
    properties {
        property ("sonar.projectKey", "urgi-is_data-discovery_AXlG7GtvPgTGgvpuDgeV")
        property ("sonar.qualitygate.wait", false)
    }
}
