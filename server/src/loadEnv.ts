import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

console.log('Environment variables loaded from:', join(__dirname, '../.env'));
if (!process.env.MONGODB_URI) {
    console.error('CRITICAL: MONGODB_URI is not set in environment!');
}
