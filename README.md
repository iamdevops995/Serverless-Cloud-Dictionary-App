# Serverless Cloud Dictionary Application

![Alt Text](https://github.com/iamdevops995/Serverless-Cloud-Dictionary-App/blob/main/serverless-amplify.png)

With EC2:

![Alt Text](https://github.com/iamdevops995/Serverless-Cloud-Dictionary-App/blob/main/architecture-image.png)

## Project Overview

This project implements a **serverless cloud dictionary application** where users can:

* Search for cloud-related terms.
* View detailed definitions of cloud technologies.
* Interact with a highly scalable backend using AWS serverless services.

The application follows a **serverless architecture**, using **AWS Lambda** for backend logic, **API Gateway** for managing API endpoints, and **DynamoDB** for storing dictionary terms and definitions.

The **frontend**, built with React, is hosted on **AWS Amplify**, and communicates with the backend via REST API calls.

---

## Features

* Search cloud terms and view definitions in real-time.
* Serverless backend ensures cost-efficient and scalable architecture.
* Easy-to-update dictionary via batch upload to DynamoDB.
* Cross-origin resource sharing (CORS) enabled for secure frontend-backend communication.

---

## AWS Services Used 🛠

* **AWS Amplify** – Hosts the React frontend application.
* **AWS Lambda** – Handles API requests for retrieving and adding dictionary terms.
* **AWS API Gateway** – Exposes REST API endpoints to interact with Lambda functions.
* **AWS DynamoDB** – Stores the dictionary data as key-value pairs (`term: definition`).
* **IAM Roles & Policies** – Provides secure access for Lambda to interact with DynamoDB and API Gateway.

---

## Project Architecture

The architecture is designed to be fully serverless:

1. The **React frontend** sends HTTPS requests to **API Gateway**.
2. **API Gateway** triggers the corresponding **Lambda function**.
3. **Lambda** queries **DynamoDB** for the requested term.
4. **DynamoDB** returns the definition to Lambda, which responds back to the frontend.

---

## Step-by-Step Implementation

### 1️⃣ Frontend Setup with AWS Amplify

## ![Alt Text])

1. Clone the React repository locally.
2. Install dependencies using:

   ```bash
   npm install
   ```
3. Test the application locally:

   ```bash
   npm start
   ```
4. Deploy the frontend to **AWS Amplify**:

   ```bash
   amplify init
   amplify add hosting
   amplify publish
   ```
5. Confirm the frontend loads and can make API requests.

---

### 2️⃣ DynamoDB Configuration

![Alt Text](https://github.com/iamdevops995/Serverless-Cloud-Dictionary-App/blob/main/DynamoDB-config.png)

1. Create a DynamoDB table named `CloudDefinitions` with `term` as the primary key.
2. Prepare dictionary data in JSON files (max 25 records per batch for AWS CLI):

   ```
   records/records-1.json
   records/records-2.json
   ...
   ```
3. Upload data using AWS CLI:

   ```bash
   aws dynamodb batch-write-item --request-items file://records/records-1.json
   aws dynamodb batch-write-item --request-items file://records/records-2.json
   aws dynamodb batch-write-item --request-items file://records/records-3.json
   aws dynamodb batch-write-item --request-items file://records/records-4.json
   ```

---

### 3️⃣ Lambda Function for Fetching Terms

![Alt Text](https://github.com/iamdevops995/Serverless-Cloud-Dictionary-App/blob/main/lambda-function.png)

Create a **Python Lambda function** with the following responsibilities:

* Extract the search term from `queryStringParameters`, `pathParameters`, or request `body`.
* Query DynamoDB for the term definition.
* Return a JSON response with the term and its definition or appropriate error messages.

**Lambda Function Code:**

```python
import json
import boto3

dynamodb = boto3.client('dynamodb')
table_name = 'CloudDefinitions'

def lambda_handler(event, context):
    try:
        term = ''
        # Check GET query parameters
        query_params = event.get('queryStringParameters') or {}
        if query_params and query_params.get('term'):
            term = query_params.get('term')
        # Check path parameters
        path_params = event.get('pathParameters') or {}
        if not term and path_params.get('term'):
            term = path_params.get('term')
        # Check POST body
        if not term and event.get('body'):
            body = json.loads(event['body'])
            term = body.get('term', '')
        # Check direct event test
        if not term:
            term = event.get('term', '')

        if not term:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'message': 'Term parameter is required'})
            }

        response = dynamodb.get_item(TableName=table_name, Key={'term': {'S': term}})
        if 'Item' in response:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'term': term, 'definition': response['Item']['definition']['S']})
            }
        else:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': f'Term "{term}" not found'})
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
```

**Test Event:**

```json
{
  "queryStringParameters": { "term": "AWS KMS" }
}
```

---

### 4️⃣ API Gateway Configuration

![Alt Text](https://github.com/iamdevops995/Serverless-Cloud-Dictionary-App/blob/main/api-gateway.png)

1. Create a **REST API** in API Gateway.
2. Integrate the API with the Lambda function using **Lambda Proxy Integration**.
3. Enable **CORS** for cross-origin requests.
4. Deploy the API and get the endpoint URL.
5. Update the frontend to point to the API Gateway URL.
6. Test the full application by searching for terms like `AWS KMS`.

---

![Alt Text](https://github.com/iamdevops995/Serverless-Cloud-Dictionary-App/blob/main/App-image.png)


## Enhancements & Future Work

* Expand the dictionary with more cloud terms.
* Add fuzzy search for partial matches.
* Introduce user authentication for adding custom terms.
* Configure custom domains and firewall for production deployment.
* Implement logging and monitoring using AWS CloudWatch.

---

## Estimated Time & Cost

* **Time:** 2–3 hours for complete setup and testing.
* **Cost:** Free-tier eligible with AWS services.

---

## Conclusion

This project demonstrates a full **serverless architecture** for a cloud dictionary application using AWS. From frontend hosting to API management and database queries, all steps are implemented in a scalable, maintainable, and cost-efficient manner.
