Feature: Model Versioning

  Scenario: Track model versions during retraining
    Given the model has been retrained using feedback
    When the backend deploys the updated model
    Then it should log the new version number and retraining dataset details
    And the metrics dashboard should reflect the updated model version
