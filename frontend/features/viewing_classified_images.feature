Feature: Viewing Classified Images

  Scenario: User views all classified images
    Given the user is on the image gallery page
    When the system retrieves classified images
    Then all classified images should be displayed

  Scenario: User filters images by classification date
    Given the user is on the image gallery page
    And images are displayed
    When the user selects a classification date filter
    Then only images classified on that date should be shown

  Scenario: User filters images by labels
    Given the user is on the image gallery page
    And images are displayed
    When the user selects a label filter
    Then only images with the selected label should be shown

  Scenario: User filters misclassified images
    Given the user is on the image gallery page
    And images are displayed
    When the user selects the "Misclassified" filter
    Then only misclassified images should be shown

  Scenario: User filters reviewed and unreviewed images
    Given the user is on the image gallery page
    And images are displayed
    When the user selects the "Reviewed" filter
    Then only images that have received user feedback should be shown
    When the user selects the "Unreviewed" filter
    Then only images that have not received user feedback should be shown
