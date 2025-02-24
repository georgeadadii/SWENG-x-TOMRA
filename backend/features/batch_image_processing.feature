Feature: Batch Image Processing

  Scenario: Process a batch of images via the classification engine
    Given a Python script reads 200 images from a directory
    When it sends the images to the image classification engine in batches
    Then the engine should classify each image and return results
    And the results should be sent to the backend through gRPC
