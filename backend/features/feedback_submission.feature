Feature: Feedback Submission

  Scenario: Submit feedback for a misclassified image
    Given an image has been classified and stored in the Graph DB
    When a user submits feedback correcting the label (e.g., "husky" → "wolf")
    Then the backend should update the Graph DB with the corrected label
    And the feedback should be flagged for review by the system administrator
