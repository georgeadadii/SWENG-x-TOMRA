Feature: Error Handling

  Scenario: Handle invalid image input
    Given the backend receives an invalid image file (e.g., corrupted or unsupported format)
    When the engine attempts to classify the image
    Then it should return an error message (e.g., "Invalid image format")
    And the error should be logged

  Scenario: Handle gRPC server connection failure
    Given the engine attempts to send classification results to the backend through gRPC
    When the server is unavailable
    Then the script should retry the connection up to 3 times
    And if the connection fails, it should log an error
