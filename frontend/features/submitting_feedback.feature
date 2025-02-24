Feature: Submitting Feedback on Image Classification

  Scenario: User submits feedback on misclassified image
    Given the user is viewing an image’s classification result
    And the image is misclassified
    When the user selects the correct label and submits feedback
    Then the system should save the feedback
    And the system should acknowledge feedback submission
