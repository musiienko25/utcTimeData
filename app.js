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
  const originalTimestamp = moment.utc(mdtTimestamp).format();
  const originalTimezone = "UTC";
  const timestamp = mdtTimestamp;
  const timezone = "MDT";
  const day = Number(date);

  const row = {
    originalTimestamp: originalTimestamp,
    originalTimezone: originalTimezone,
    timestamp: String(timestamp),
    timezone: timezone,
    day: String(day),
    month: month,
    year: year,
  };

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
  // const { data: utcData } = await getCurrentUTCTime();
  const test = {
    abbreviation: "UTC",
    client_ip: "178.151.207.216",
    datetime: "2023-05-11T13:31:08.193649+00:00",
    day_of_week: 4,
    day_of_year: 131,
    dst: false,
    dst_from: null,
    dst_offset: 0,
    dst_until: null,
    raw_offset: 0,
    timezone: "Etc/UTC",
    unixtime: 1683811868,
    utc_datetime: "2023-05-11T13:31:08.193649+00:00",
    utc_offset: "+00:00",
    week_number: 19,
  };
  const utcData = test;
  if (utcData) {
    const mdtTimestamp = convertToMDTTimestamp(utcData);
    insertRowToBigQuery(mdtTimestamp);
  }
};

main();
