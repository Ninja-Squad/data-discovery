import org.gradle.api.*
import org.gradle.kotlin.dsl.*

private val acceptableValues = setOf("rare", "wheatis", "gnpis")

val Project.app: String
    get() = findProperty("app")
        ?.let { it as String }
        ?.also {
            require(it in acceptableValues) {
                "Invalid value for property app. Valid values are $acceptableValues."
            }
        } ?: "rare"
