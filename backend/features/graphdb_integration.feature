Feature: Graph DB Integration

  Scenario: Store classification results in the Graph DB
    Given the classification engine has processed an image
    When the backend receives the result
    Then it should store the image ID, predicted label, confidence score, and classification date in the Graph DB
    And the data should be queryable for future use
