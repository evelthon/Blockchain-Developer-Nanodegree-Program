# RESTful Web API with Node.js Framework

The project goal is to build a RESTful API using a Node.js framework that will interface with our private blockchain. The endpoints are created using hapi.
The API service runs on port 8000. The default URL uses localhost for connectivity (http://localhost:8000).

## Getting Started

These instructions will install requirements and allow you to execute the code.
### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/]. Most Linux distributions have ready-to-install packages.

### Configuring your project


- Install requirements
```
npm install 
```
- Execute program
```
npm start
```

After successful execution you should end up with:
 - A Genesis Block (#0)
 - 20 additional Blocks
 - A validation confirmation of the Blockchain
 
 
### You should now have two REST endpoints:
 - GET /block/{block_id} will return block information in json format. 
    - If block_id is omitted, the Genesis Block is returned.
    - If block_id does not exist, this is displayed in the returned result set like so:
     ```
    hash	""
    height	-1
    body	"Not found"
    time	""
    previousBlockHash	""
    ```


- POST /block with body data. The create block is returned in json format.
    - Post block like: 
    ```
    curl -X "POST" "http://localhost:8000/block" -H 'Content-Type: application/json' -d $'{"body":"block body contents"}
    ```
 
 
 