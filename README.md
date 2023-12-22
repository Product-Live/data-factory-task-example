# Product-Live Data Factory custom task example

This repository contains a simple illustration of how to run a custom task in a Data Factory pipeline. For more information on how to setup a Data Factory account, please refer to our online documentation.

## What is a custom task?

In addition to the tasks natively managed by the Data Factory platform, you can also declare your own tasks, whose execution you can control outside our infrastructure.

The possible uses are among the following:

- Intensive computing
- Functionality not available natively
- Connection to services that are not publicly available via the Internet

## Purpose of this example

The sole purpose of this task is to serve as an example for future developments. It implements a task that calculates a power of 2, which is passed as a parameter to this task.

For example, for input `power=10`, the result is `1024`

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
It will return a `task definition id`.

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

You can either create the job via the [Job API](https://api.product-live.com/) or via the UI at settings.product-live.com. Either way, you should obtain a `job id`.

3. Create a `.env` and fill it with the following variables:

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

5. Run the job in your Data Factory pipeline

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

6. Check the result of the job execution

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

### Running the task

These examples use the [`Data Factory Nest` module](https://github.com/Product-Live/data-factory-nest), that hides part of the complexity of writing a custom task.
Via our SDK, the task uses the the [Task API](https://api.product-live.com/).

The task can only execute is there is an available slot in the pipeline. To check when a slot is available, the task regularly calls `data_factory/task/{task_definition_id}/poll`.
When a slot is available, the call returns a `task instance`, which contains the input necessary to run the task. Then the task is run, the task instance is updated and sent back via a `PATCH` at `data_factory/task_executions/{task_definition_id}`.

When the status of the task instance is `COMPLETED`, data factory knows to proceed with the next task in the job. The call in step 6 can be used to check the result of the job.  

Apart from the API calls above, the task may also need to use the [File API](https://api.product-live.com/). 
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
