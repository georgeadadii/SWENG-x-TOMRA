## Make sure to run `pip install -r requirements.txt` to install the required Python packages

## Setting Up Environment Variables

1. Create a `.env` file in the root directory of the project.
2. Copy the contents of `.env.example` into `.env`.
3. Replace the placeholder values in `.env` with your actual credentials, these can be found in the secrets protected branch on gitlab.

Example:
```plaintext
COSMOS_ENDPOINT=https://your-cosmos-endpoint.com:123/
COSMOS_KEY=your_cosmos_key_here
DATABASE_NAME=your_database_name_here
CONTAINER_NAME=your_container_name_here
```

## To set up Neo4j locally:

1. Install Neo4j Desktop and create a new project.

2. Click the "+ Add" button and select Local DBMS

3. The name of the database does not matter but make sure the password is set to "password"

4. Start the database and make sure it's running

## Accessing Azure Key Vault Secrets with RBAC

1. Install the [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli).
2. Log in to Azure using your TCD account:

   ```bash
   az login --use-device-code
   ```

   

## To start GraphQL and FastAPI backend:

  Run `main.py`

## To start the gRPC servers:

Run `python model_service.py`
    
`python neo4j_service.py`

`python model_client.py` in seperate terminals.

  Some images for the model_service are already provided in \unprocessed_images\

## Additional Models

This system allows users to choose between different machine learning models for image processing. Currently, two models are supported:

- YOLO (You Only Look Once): A state-of-the-art object detection model.

- EfficientNet: A lightweight and efficient image classification model.

Users can specify the model they want to use by passing the `--model` argument with either yolo or efficientnet.

### How to Select Models

To use the feature, run the `model_client` script with the `--model` argument to specify the model (yolo or efficientnet):


```bash
python model_client.py --model yolo
```
or
```bash
python model_client.py --model efficientnet
```

### Adding New Models

To add a new model:

1. Create a new model class in the models/ directory (e.g., `new_model.py`).

2. Implement the required methods (e.g., `process_image`).

3. Update the ModelFactory class in model_factory.py to include the new model.

4. Add the model to the --model argument options in `model_client.py`.

## Model Quantization for Green Computing

Quantization reduces the precision of the model's weights from 32-bit floating point to 8-bit integers. This can significantly reduce memory usage, computational requirements, and energy consumption.

### How to Enable Quantization

To enable quantization, run `model_client.py` with the `--quantize` flag:

```bash
python model_client.py --quantize
```

## GraphQL Queries

Go to http://localhost:8000/graphql

To query all metrics, use the following GraphQL query:

```graphql
query {
  metrics {
    metricId
    averageConfidenceScore
    averageInferenceTime
    categoryDistribution
    categoryPercentages
    confidenceDistribution
    detectionCountDistribution
    inferenceTimeDistribution
    labelAvgConfidences
    detectionCountDistribution
    totalImages
    totalInferenceTime
    totalPostprocessingTime
    totalPreprocessingTime
    totalTime
    averageBoxSize
    boxSizeDistribution
    averageBoxProportion
    boxProportionDistribution
    averagePreprocessTime
    averagePostprocessTime
    preprocessTimeDistribution
    postprocessTimeDistribution
  }
}
```

To query all results and their corresponding images, use the following GraphQL query:

```graphql
query {
  results {
    classLabel
    confidence
    imageUrl
  }
}
```


## To view the database:

1. Go to http://localhost:7474/browser/

2. Log in with the following details:
        User: neo4j
        Password: password

3. Run the query `MATCH (n) RETURN (n)` to see all nodes in the database

4. Run the query `MATCH (r:Result) RETURN r` to see all classification result nodes

    If you make new node labels, and would like to view these:

    Run the query:
    ```neo4j
    MATCH (i:[NODE]) RETURN i
    ```
    where `[NODE]` is the name of the new label

## To clear the database:

To delete all nodes currently stored in the database, run the following query:

        MATCH (n) DETACH DELETE n;

## Changing gRPC contracts:

  gRPC contracts are in \protos\

  If you make any changes to the contract, you must run `python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. [FILE].proto`, where `[FILE]` is the name of the edited .proto file

  This will generate TWO new _pb2.py files

  You must replace the pre-existing _pb2.py files with these newly generated ones
