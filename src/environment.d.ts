declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AWS_ACCESS_KEY_ID: string;
      AWS_BUCKET_NAME: string;
      AWS_BUCKET_REGION: string;
      AWS_SECRET_ACCESS_KEY: string;
      DATABASE_URL: string;
    }
  }
}

export {};
