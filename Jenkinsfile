pipeline {
  agent any
  stages {
    stage('Build') { steps { sh 'docker build -t hybrid-playwright-api .' } }
    stage('Test') { steps { sh 'docker run --rm hybrid-playwright-api' } }
  }
  post {
    always {
      archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
    }
  }
}
