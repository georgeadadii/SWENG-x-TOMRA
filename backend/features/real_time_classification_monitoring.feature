Feature: Real-Time Classification Monitoring

  Scenario: Monitor real-time classification performance
    Given the classification engine is processing images in real-time
    When the backend receives a request for metrics
    Then it should return the number of images processed, average confidence score, and error rate
    And the data should update dynamically on the dashboard
