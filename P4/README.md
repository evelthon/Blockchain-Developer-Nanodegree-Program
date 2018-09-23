# TODO: Project4
The project goal is to build a RESTful API using a Node.js framework that will interface with our private blockchain. 
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

After successful execution you should end up with a Genesis Block (#0)

You are offered the following endpoints: 
- POST /requestValidation ()
- POST /message-signature/validate
- POST /block
- GET /stars/hash:[HASH]
- GET /stars/address:[ADDRESS]
- GET /block/[HEIGHT]

 
 

 - GET /block/{block_id} responds as follows: 
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
    
### Steps to add new Block (Star)
#### 1. Post a validation request
Type
```
POST
```
Parameters
```
address
```

![screenshot_20180923_185116](https://user-images.githubusercontent.com/15610147/45930163-dcfcf400-bf64-11e8-912a-10c032b318e5.png)


#### 2. Sign your message
Use Ethereum to create a signature.

![2](https://user-images.githubusercontent.com/15610147/45930151-ceaed800-bf64-11e8-8cb7-6c362edafeed.png)






#### 3. Post a signature validation request
Type
```
POST
```
Parameters
```
address
signature
```
![3](https://user-images.githubusercontent.com/15610147/45930152-ceaed800-bf64-11e8-85aa-72323f036afb.png)

#### 4. Post Block data with star details
Type
```
POST
```
Parameters
```
Block details including address and star details.
```
![4](https://user-images.githubusercontent.com/15610147/45930153-ceaed800-bf64-11e8-9ed9-f926b1eb9089.png)



### To retrieve stored data
#### 1. Get star block by hash
Type
```
GET
```
Parameters
```
hash
```
![5](https://user-images.githubusercontent.com/15610147/45930154-cf476e80-bf64-11e8-8fd2-59085b6ac393.png)
#### 2. Get block by wallet address
Type
```
GET
```
Parameters
```
address
```
![6](https://user-images.githubusercontent.com/15610147/45930155-cf476e80-bf64-11e8-96f2-e69416c373ce.png)
#### 3. Get block by height
Type
```
GET
```
Parameters
```
height
```
![7](https://user-images.githubusercontent.com/15610147/45930156-cf476e80-bf64-11e8-917b-4c8079e4c2d4.png)



 
 
 