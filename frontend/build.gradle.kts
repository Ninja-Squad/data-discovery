import com.github.gradle.node.pnpm.task.PnpmInstallTask
import com.github.gradle.node.pnpm.task.PnpmTask
import frontend.versionsFromPackageJson

plugins {
  base
  id("com.github.node-gradle.node") version "7.1.0"
  id("org.sonarqube")
}

val isCi = System.getenv("CI") != null

val versions = versionsFromPackageJson(file("package.json"))

node {
  version.set(versions.node)
  pnpmVersion.set(versions.pnpm)

  if (isCi) {
    // we specify a custom installation directory because of permission issues on Docker
    workDir.set(file("/tmp/node"))
    pnpmWorkDir.set(file("/tmp/pnpm"))
  }
  download.set(true)
}

tasks {
  npmInstall {
    enabled = false
  }

  val prepare by registering {
    dependsOn(PnpmInstallTask.NAME)
  }

  val pnpmBuild by registering(PnpmTask::class) {
    inputs.property("app", project.app)

    args.set(listOf("build:${project.app}"))
    dependsOn(prepare)
    inputs.dir("src")
    outputs.dir("dist")
  }

  val pnpmTest by registering(PnpmTask::class) {
    args.set(listOf("test"))
    dependsOn(prepare)
    inputs.dir("src")
    outputs.dir("coverage")
  }

  val pnpmTestMultiBrowsers by registering(PnpmTask::class) {
    args.set(listOf("test-multi-browsers"))
    dependsOn(prepare)
    inputs.dir("src")
    outputs.dir("coverage")
  }

  val pnpmLint by registering(PnpmTask::class) {
    args.set(listOf("lint"))
    dependsOn(prepare)
    inputs.dir("src")
    inputs.file("eslint.config.js")
    inputs.file(".prettierrc")
    outputs.file(layout.buildDirectory.file("eslint-result.txt"))
  }

  val lint by registering {
    dependsOn(pnpmLint)
  }

  val pnpmE2e by registering(PnpmTask::class) {
    args.set(listOf("e2e:standalone"))
    dependsOn(prepare)
    inputs.dir("src")
    inputs.dir("e2e")
    inputs.file("playwright.config.ts")
    inputs.file("package.json")
    outputs.dir("playwright-report")
  }

  val e2e by registering {
    dependsOn(pnpmE2e)
  }

  val test by registering {
    if (isCi) {
      dependsOn(pnpmTestMultiBrowsers)
    } else {
      dependsOn(pnpmTest)
    }
  }

  check {
    dependsOn(lint)
    dependsOn(test)
    dependsOn(e2e)
  }

  assemble {
    dependsOn(pnpmBuild)
  }

  val clean by getting {
    dependsOn("cleanPnpmBuild")
    dependsOn("cleanPnpmTest")
    dependsOn("cleanPnpmE2e")
  }
}

