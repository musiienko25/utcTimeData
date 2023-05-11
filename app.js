const { BigQuery } = require("@google-cloud/bigquery");
const axios = require("axios");
const moment = require("moment-timezone");

require("dotenv").config();

// Set up Google Cloud BigQuery API client
const bigqueryClient = new BigQuery({
  projectId: process.env.PROJECT_ID,
  credentials: {
    client_email: process.env.CLIENT_EMAIL,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
});

// Set up UTC API endpoint URL
const UTC_API_URL = "http://worldtimeapi.org/api/timezone/Etc/UTC";

// Get current UTC time data
const getCurrentUTCTime = async () => {
  try {
    const response = await axios.get(UTC_API_URL);
    return response.data;
  } catch (error) {
    console.error(`Failed to get UTC time data: ${error}`);
    return null;
  }
};

// Convert UTC time data into MDT timezone timestamp
const convertToMDTTimestamp = (utcData) => {
  const utcTimestamp = moment.utc(utcData.datetime).valueOf();
  const mdtTimestamp = moment(utcTimestamp).tz("America/Denver").valueOf();
  return mdtTimestamp;
};

// Insert new row into BigQuery table
const insertRowToBigQuery = async (mdtTimestamp) => {
  const [date, month, year] = moment(mdtTimestamp)
    .format("DD/MM/YYYY")
    .split("/");
  const originalTimestamp = moment.utc(mdtTimestamp).format();
  const originalTimezone = "UTC";
  const timestamp = mdtTimestamp;
  const timezone = "MDT";
  const day = Number(date);
  const row = {
    originalTimestamp,
    originalTimezone,
    timestamp,
    timezone,
    day,
    month,
    year,
  };
  try {
    const [result] = await bigqueryClient
      .dataset(process.env.DATASET_ID)
      .table(process.env.TABLE_ID)
      .insert(row);
    console.log(`Inserted row: ${JSON.stringify(result)}`);
  } catch (error) {
    console.error(`Failed to insert row to BigQuery: ${error}`);
  }
};

// Main function to retrieve UTC time data, convert it, and insert it into BigQuery
const main = async () => {
  const utcData = await getCurrentUTCTime();
  if (utcData) {
    const mdtTimestamp = convertToMDTTimestamp(utcData);
    insertRowToBigQuery(mdtTimestamp);
  }
};

main();
