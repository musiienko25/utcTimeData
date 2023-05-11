const { BigQuery } = require("@google-cloud/bigquery");
const moment = require("moment-timezone");
const axios = require("axios");

require("dotenv").config();

const bigqueryClient = new BigQuery({
  projectId: process.env.PROJECT_ID,
  credentials: {
    client_email: process.env.CLIENT_EMAIL,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
});

const UTC_API_URL = "http://worldtimeapi.org/api/timezone/Etc/utc";

const getCurrentUTCTime = () => {
  return axios(UTC_API_URL);
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
  const row = [
    {
      original_timestamp: moment.utc(mdtTimestamp).format(),
      original_timezone: "UTC",
      timestamp: mdtTimestamp,
      timezone: "MDT",
      day: Number(date),
      month: month,
      year: year,
    },
  ];
  console.log(row);
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
  const { data: utcData } = await getCurrentUTCTime();

  if (utcData) {
    const mdtTimestamp = convertToMDTTimestamp(utcData);
    insertRowToBigQuery(mdtTimestamp);
  }
};

main();
