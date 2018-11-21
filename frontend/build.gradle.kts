import com.moowork.gradle.node.yarn.YarnTask

plugins {
  base
  id("com.moowork.node") version "1.2.0"
}

val isCi = System.getenv("CI") != null

node {
  version = "8.11.3"
  npmVersion = "6.2.0"
  yarnVersion = "1.7.0"
  if (isCi) {
    // we specify a custom installation directory because of permission issues on Docker
    workDir = file("/tmp/node")
    yarnWorkDir = file("/tmp/yarn")
  }
  download = true
}

tasks {
  val npmInstall by getting {
    enabled = false
  }

  val yarn_install by getting {
    inputs.file("package.json")
    inputs.file("yarn.lock")
    outputs.dir("node_modules")
  }

  val yarn_build by creating(YarnTask::class) {
    inputs.property("app", project.app)

    args = listOf("build:${project.app}")
    dependsOn(yarn_install)
    inputs.dir("src")
    outputs.dir("dist")
  }

  val yarn_run_test by getting {
    inputs.dir("src")
    outputs.dir("coverage")
  }

  val yarn_run_testall by getting {
    inputs.dir("src")
    outputs.dir("coverage")
  }

  val test by creating {
    dependsOn(yarn_run_test)
  }

  val testall by creating {
    dependsOn(yarn_run_testall)
  }

  val check by getting {
    dependsOn(test)
  }

  val assemble by getting {
    dependsOn(yarn_build)
  }

  val clean by getting {
    dependsOn("cleanYarn_build")
    dependsOn("cleanYarn_run_test")
  }
}
