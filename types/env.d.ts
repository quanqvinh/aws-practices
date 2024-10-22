declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AWS_ACCOUNT_ID: string
      AWS_REGION: string
    }
  }
}

export {}
