import org.gradle.api.*

private val acceptableValues = setOf("rare", "rare-with-basket", "wheatis", "data-discovery")

val Project.app: String
    get() = findProperty("app")
        ?.let { it as String }
        ?.also {
            require(it in acceptableValues) {
                "Invalid value for property app. Valid values are $acceptableValues. The current value is : $it"
            }
        } ?: "rare"
