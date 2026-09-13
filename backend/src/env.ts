// This file must be imported FIRST to ensure environment variables
// are available before any other module reads process.env.
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

// Force Node.js fetch (undici) to prefer IPv4 over IPv6.
// Fixes "TypeError: fetch failed (ConnectTimeoutError)" on Windows dual-stack networks when connecting to Supabase.
dns.setDefaultResultOrder('ipv4first');

// Load environment variables from current working directory .env, backend/.env, and root .env
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
