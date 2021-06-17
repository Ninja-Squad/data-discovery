import org.gradle.api.*

private val acceptableValues = setOf("rare", "brc4env", "wheatis", "faidare")

val Project.app: String
    get() = findProperty("app")
        ?.let { it as String }
        ?.also {
            require(it in acceptableValues) {
                "Invalid value for property app. Valid values are $acceptableValues. The current value is : $it"
            }
        } ?: "rare"
