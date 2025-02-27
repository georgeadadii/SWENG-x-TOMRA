Feature: Viewing Image Classification Results

  Scenario: User views classification details of an image
    Given the user is on the image classification page
    And there is a gallery of images
    When the user clicks on an image
    Then the classification result should be displayed
    And the option to provide feedback should be available
