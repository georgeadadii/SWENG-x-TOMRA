Feature: Image Classification

  Scenario: Classify an image and send results using the gRPC backend service
    Given the backend service is running and connected to the classification engine
    When an image is classified using the image classification engine
    Then the engine should send the predicted label and confidence score to the backend through gRPC
    And the result should be stored in the Graph DB
