const { Client } = require('pg');

const run = async () => {
  const url = 'postgresql://postgres.zvdcmgsdepfqnovksmjt:F4r174l%40si.@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';
  const client = new Client({
    connectionString: url,
  });

  try {
    await client.connect();
    console.log("Connected successfully!");
    await client.end();
  } catch (err) {
    console.error("Connection error", err.message);
  }
};

run();
