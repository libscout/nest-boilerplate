import { config } from 'dotenv';

config();

process.env['IS_TEST_ENV'] = 'true';
