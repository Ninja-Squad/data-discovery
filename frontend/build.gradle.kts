plugins {
  base
  id("com.moowork.node") version "1.2.0"
}

node {
  version = "8.11.3"
  npmVersion = "6.2.0"
  yarnVersion = "1.7.0"
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

  val yarn_build by getting {
    inputs.dir("src")
    outputs.dir("dist")
  }

  val yarn_run_test by getting {
    inputs.dir("src")
    outputs.dir("coverage")
  }

  val test by creating {
    dependsOn(yarn_run_test)
  }

  val check by getting {
    dependsOn(test)
  }

  val assemble by getting {
    dependsOn(yarn_build)
  }

  val clean by getting {
    dependsOn("cleanYarn_run_build")
    dependsOn("cleanYarn_run_test")
  }
}
