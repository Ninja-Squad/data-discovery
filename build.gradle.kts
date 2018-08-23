import org.gradle.tooling.BuildException

subprojects {
    val app by this.extra {
        val appProperty = project.findProperty("app") ?: "rare"
        val acceptableValues = setOf("rare", "wheatis")
        if (!acceptableValues.contains(appProperty)) {
            throw BuildException("Invalid value for property app. Valid values are ${acceptableValues}.", null)
        }
        appProperty as String
    }
}

