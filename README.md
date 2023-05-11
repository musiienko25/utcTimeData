# Example of NEAR Wallet integration

Homework Assignment:

Title: Integration of UTC Time Data with a Database

Objective: Demonstrate your ability as a JavaScript developer using Node.js to retrieve UTC time data from an external platform, modify it to the correct timestamp, and post it into a database like Google BigQuery.

Task Description:

Set up the development environment: Start by setting up Node.js and npm (Node Package Manager) on your local development environment.
Retrieve UTC Time Data: Use a public API that provides UTC time data, such as WorldTimeAPI. Write a Node.js application that sends a GET request to this API and retrieves the current UTC time data. You may use any HTTP client you choose (like 'Axios' or 'node-fetch').
Convert UTC Time Data: Convert the UTC time data into a timestamp suitable for BigQuery in MDT timezone. Store the timestamp in milliseconds since the Unix Epoch (1970-01-01 00:00:00).
Post to BigQuery: Create the table with the Google Cloud BigQuery API to insert a new row with the fields below. You will need to set up a Google Cloud project, enable the BigQuery API, and authenticate your application. (Google Cloud project is free to start). with the fields:
Original Timestamp,
Original Timezone,
Timestamp,
Timezone,
Day,
Month,
Year

Code Submission:

App.js: This is the main application file. It should include the logic for retrieving the UTC time data, converting it, and posting it to BigQuery.
Package.json: This file should list all the npm dependencies used in your application.
.env: This file should contain your Google Cloud project credentials. Please make sure to include a ‘.env.example’ file demonstrating the needed environment variables without exposing any sensitive information.
createTable.sql: This is the SQL script to create the BigQuery table.
Readme.md: A brief document explaining how to run your code and any other necessary instructions.
GitHub Please post code on a github repo, and share .env file separately in Upwork Messages.
Loom Please record a short overview of your project, walking through your code, and the application running.

Evaluation Criteria:

Correctness: Does the program perform the task as required?
Code Quality: Is the code readable, well-organized, and documented?
Error Handling: Does the code gracefully handle potential errors and edge cases?
Efficiency: Is the code free of unnecessary computations or API requests?
Timeframe: You should spend no more than 2 hours on this assignment.

Note: Please be sure to respect all terms of use for the APIs you interact with for this assignment. Do not expose any API keys or sensitive information in your code or any public repository.

## Getting started

Start the example!

```
yarn start
```
