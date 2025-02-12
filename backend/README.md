## Make sure to run `pip install -r requirements.txt` to install the required Python packages

## You must also set up Neo4j:

    Install Neo4j Desktop and create a new project.

    Click the "+ Add" button and select Local DBMS

    The name of the database does not matter but make sure the password is set to "password"

    Create a database and note the connection details (URI, username, password).

## To start the gRPC servers:

    Run `python model_service.py`
    
    `python neo4j_service.py`

    `python model_client.py` in seperate terminals.

    Some images for the model_service are already provided in \unprocessed_images\

## To view the database:

    Go to http://localhost:7474/browser/

    Run the query "MATCH (r:Result) RETURN r" to see all classification result nodes

    If you make new node labels (for example, image nodes), and would like to view these:

        Run the query "MATCH (i:[NODE]) RETURN i", where [NODE] is the name of the new label

## Changing gRPC contracts:

    gRPC contracts are in \protos\

    If you make any changes to the contract, you must run `python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. [FILE].proto`, where [FILE] is the name of the edited .proto file

    This will generate TWO new _pb2.py files

    You must replace the pre-existing _pb2.py files with these newly generated ones
