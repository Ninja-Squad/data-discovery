import com.github.gradle.node.yarn.task.YarnInstallTask
import com.github.gradle.node.yarn.task.YarnTask

plugins {
  base
  id("com.github.node-gradle.node") version "3.0.1"
  id("org.sonarqube")
}

val isCi = System.getenv("CI") != null

node {
  version.set("14.17.0")
  npmVersion.set("6.14.10")
  yarnVersion.set("1.22.10")

  if (isCi) {
    // we specify a custom installation directory because of permission issues on Docker
    workDir.set(file("/tmp/node"))
    yarnWorkDir.set(file("/tmp/yarn"))
  }
  download.set(true)
}

tasks {
  npmInstall {
    enabled = false
  }

  named<YarnInstallTask>(YarnInstallTask.NAME) {
    ignoreExitValue.set(true)
  }

  val prepare by registering {
    dependsOn(YarnInstallTask.NAME)
  }

  val yarnBuild by registering(YarnTask::class) {
    inputs.property("app", project.app)

    args.set(listOf("build:${project.app}"))
    dependsOn(prepare)
    inputs.dir("src")
    outputs.dir("dist")
  }

  val yarnTest by registering(YarnTask::class) {
    args.set(listOf("test"))
    dependsOn(prepare)
    inputs.dir("src")
    outputs.dir("coverage")
  }

  val yarnTestMultiBrowsers by registering(YarnTask::class) {
    args.set(listOf("test-multi-browsers"))
    dependsOn(prepare)
    inputs.dir("src")
    outputs.dir("coverage")
  }

  val yarnLint by registering(YarnTask::class){
    args.set(listOf("lint"))
    dependsOn(prepare)
    inputs.dir("src")
    inputs.file(".eslintrc.json")
    inputs.file(".prettierrc")
    outputs.file("$buildDir/eslint-result.txt")
  }

  val lint by registering {
    dependsOn(yarnLint)
  }

  val yarnE2e by registering(YarnTask::class){
    args.set(listOf("e2e:standalone"))
    dependsOn(prepare)
    inputs.dir("src")
    inputs.dir("cypress")
    inputs.file("cypress.json")
    inputs.file("package.json")
    outputs.file("$buildDir/cypress-result.json")
  }

  val e2e by registering {
    dependsOn(yarnE2e)
  }

  val test by registering {
    if (isCi) {
      dependsOn(yarnTestMultiBrowsers)
    } else {
      dependsOn(yarnTest)
    }
  }

  check {
    dependsOn(lint)
    dependsOn(test)
    dependsOn(e2e)
  }

  assemble {
    dependsOn(yarnBuild)
  }

  val clean by getting {
    dependsOn("cleanYarnBuild")
    dependsOn("cleanYarnTest")
    dependsOn("cleanYarnE2e")
  }
}

