const { BigQuery } = require("@google-cloud/bigquery");
const moment = require("moment-timezone");

require("dotenv").config();

const bigqueryClient = new BigQuery({
  projectId: process.env.PROJECT_ID,
  credentials: {
    client_email: process.env.CLIENT_EMAIL,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
});

const UTC_API_URL = "http://worldtimeapi.org/api/timezone/Etc/UTC";

const fetch = require("node-fetch");

const getCurrentUTCTime = () => {
  return fetch(UTC_API_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to get UTC time data: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error(`Failed to get UTC time data: ${error}`);
      return null;
    });
};

const convertToMDTTimestamp = (utcData) => {
  const utcTimestamp = moment.utc(utcData.datetime).valueOf();
  const mdtTimestamp = moment(utcTimestamp).tz("America/Denver").valueOf();
  return mdtTimestamp;
};

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

const main = async () => {
  const utcData = await getCurrentUTCTime();
  if (utcData) {
    const mdtTimestamp = convertToMDTTimestamp(utcData);
    insertRowToBigQuery(mdtTimestamp);
  }
};

main();
