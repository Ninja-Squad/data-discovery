plugins {
    id("org.sonarqube") version "7.2.3.7755"
}

sonarqube {
    properties {
        property ("sonar.projectKey", "urgi-is_data-discovery_AXlG7GtvPgTGgvpuDgeV")
        property ("sonar.qualitygate.wait", false)
    }
}
