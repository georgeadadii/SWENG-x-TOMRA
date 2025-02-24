Feature: Reviewing an Image's Classification

  Scenario: User marks an image as reviewed
    Given the user is viewing an image’s classification result
    And the image has not been reviewed yet
    When the user submits feedback
    Then the system should mark the image as "Reviewed"

  Scenario: User updates review feedback
    Given the user has already reviewed an image
    When they update their feedback
    Then the system should update the review status
    And reflect the latest feedback
