# Product-Live Data Factory custom task example

This repository contains a simple illustration of how to run a custom task in a Data Factory pipeline. For more information on how to setup a Data Factory account, please refer to our online documentation.

## Prerequisites

The prerequisites to run this example are:

- A Product-Live account
- A valid Data Factory subscription and a pipeline
- Access to the Product-Live API and a valid API key
- Node.js installed on your machine

## Configuration

1. Create a custom task in your Product-Live account

To do so, you may use the [Task API](https://api.product-live.com/)

```bash
curl -X 'POST' \
  'https://api.product-live.com/v1/data_factory/tasks' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-Api-Key: <your-api-access-token>' \
  -d '{
  "key": "<your-task-key>",
  "description": "<your task description>",
  "retryCount": 0,
  "inputKeys": [],
  "outputKeys": []
}'
```

2. Create a job using the previously created task

To do so, edit the sample job `run-task` provides with this repository (`jobs/run-task`). You will need to edit the name of the task to run.

```json
{
  "schema": "1.0",
  "key": "run-task",
  "title": "Run my task",
  "tasks": [
    {
      "name": "${account}/example-task",
      "taskReferenceName": "task",
      "description": "Process my data",
      "optional": false,
      "type": "SUB_WORKFLOW",
      "inputParameters": {}
    }
  ]
}
```

The name of the task should match the key of the task you created in the previous step. In the example below, the name of the task is `${account}/example-task`. If you used the key 'my-task' when creating the task, the name of the task should be `${account}/my-task`. Refer to the [Data Factory documentation](https://learn.product-live.com/data-factory/tutorials/create-my-first-job/) for more information on how to create a job.

3. create a `.env` and fill it with the following variables:

```bash
API_ACCESS_TOKEN=<you api access token>
TASK_DEFINITION_ID=<the previously created task definition id>
API_BASE_PATH=https://api.product-live.com
```

4. Run this example on your machine

```bash
npm run install
npm run start:dev
```

5. Run the task in your Data Factory pipeline

```bash
curl -X 'POST' \
  'https://api-next.stage.product-live.com/v1/data_factory/job_executions' \
  -H 'accept: application/json' \
  -H 'X-Api-Key: <your-api-access-token>' \
  -H 'Content-Type: application/json' \
  -d '{
  "jobId": "<the previously created job id>",
  "input": {
    # The input data for the task, this is an example
    "power": 10
  }
}'
```

6. Check the result of the task

```bash
curl -X 'GET' \
  'https://api-next.stage.product-live.com/v1/data_factory/job_executions/<the id of the job execution created in the previous step>' \
  -H 'accept: application/json' \
  -H 'X-Api-Key: <your-api-access-token>'
```

If the task has been handled correctly by the application running on your machine, you should obtain a response as below:

```json
{
  "object": "job_execution",
  "jobId": "<the id your job>",
  "id": "<the job execution id>",
  "pipelineId": "<your pipeline id>",
  "createdAt": "2023-07-31T09:11:33.236Z",
  "endedAt": "2023-07-31T09:12:23.044Z",
  "input": {
    "power": 10,
    "context": {
      "jobAccountId": "<the id of the ower of the job, a job may be share with several accounts>",
      "jobId": "<your job id>",
      "userAccountId": "<your account id>",
      "userId": "<your user id>"
    }
  },
  "startedAt": "2023-07-31T09:11:33.146Z",
  "status": "COMPLETED",
  "output": {
    "result": 524288
  },
  "info": {
    "title": "Run my task"
  }
}
```

## Project structure

The project is structured as follows:

- The entry point is the `main.ts` file
- The `task` module contains the custom task implementation
- the `datafactory` module contains the Data Factory logic, which is responsible for polling the next task to run and for sending the task result back to the Data Factory platform

## How to run

To run this example, execute the following commands:

```bash
npm install
npm run build
npm run start
```
