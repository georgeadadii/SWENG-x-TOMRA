Feature: Feedback Aggregation

  Scenario: Aggregate feedback for model retraining
    Given feedback on misclassified images has been submitted multiple times
    When the system administrator requests a feedback report
    Then the backend should compile a list of frequently misclassified labels
    And the report should include the number of corrections per label
