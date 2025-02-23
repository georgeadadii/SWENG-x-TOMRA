## Make sure to run `pip install -r requirements.txt` to install the required Python packages

## You must also set up Neo4j:

    Install Neo4j Desktop and create a new project.

    Click the "+ Add" button and select Local DBMS

    The name of the database does not matter but make sure the password is set to "password"

    Start the database and make sure it's running

## To start GraphQL and FastAPI backend:

    Run `main.py`

## To start the gRPC servers:

    Run `python model_service.py`
    
    `python neo4j_service.py`

    `python model_client.py` in seperate terminals.

    Some images for the model_service are already provided in \unprocessed_images\

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

    Go to http://localhost:7474/browser/

    Log in with the following details:
        User: neo4j
        Password: password

    Run the query "MATCH (n) RETURN (n)" to see all nodes in the database

    Run the query "MATCH (r:Result) RETURN r" to see all classification result nodes

    If you make new node labels (for example, image nodes), and would like to view these:

        Run the query "MATCH (i:[NODE]) RETURN i", where [NODE] is the name of the new label

## To clear the database:

    To delete all nodes currently stored in the database, run the following query:

        MATCH (n) DETACH DELETE n;

## Changing gRPC contracts:

    gRPC contracts are in \protos\

    If you make any changes to the contract, you must run `python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. [FILE].proto`, where [FILE] is the name of the edited .proto file

    This will generate TWO new _pb2.py files

    You must replace the pre-existing _pb2.py files with these newly generated ones
