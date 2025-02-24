Feature: Model Metrics Dashboard

  Scenario: User views model performance metrics
    Given the user is on the model dashboard page
    When the system retrieves model performance metrics
    Then the dashboard should display accuracy, misclassification statistics and other key metrics
