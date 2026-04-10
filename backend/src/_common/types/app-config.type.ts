import { DataSourceOptions } from 'typeorm';

export interface AppConfig {
  appName: string;
  databaseConnectionOptions: DataSourceOptions;
  jwtSecret: string;
  accessTokenExpires: string;
}
