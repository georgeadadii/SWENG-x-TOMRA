Feature: Performance Metrics Calculation

  Scenario: Calculate model performance metrics
    Given the classification engine has processed a batch of images
    When the backend receives a request for performance metrics
    Then it should compute accuracy, precision, recall, F1 score and confusion matrix
    And the results should be displayed on the metrics dashboard
