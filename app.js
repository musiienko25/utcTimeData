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
  return axios(UTC_API_URL, { timeout: 5000 });
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
      string_field_0: moment.utc(mdtTimestamp).format(),
      string_field_1: "UTC",
      string_field_2: mdtTimestamp.toString(),
      string_field_3: "MDT",
      string_field_4: date,
      string_field_5: month,
      string_field_6: year,
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
