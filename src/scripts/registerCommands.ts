import Config from "../config.js";

import dotenv from "dotenv";
dotenv.config();

Config.validateConfig();

import BaseClient from "../client.js";
const client = new BaseClient(true);
