Feature: Model Retraining

  Scenario: Model retraining based on feedback
    Given feedback has been aggregated and a threshold for retraining is met
    When the system administrator initiates retraining
    Then the backend should extract misclassified images and corrected labels from the Graph DB
    And the model should be retrained using an updated dataset
