import Config from "../config.js";

import dotenv from "dotenv";
dotenv.config();

Config.validateConfig();

import BaseClient from "../client.js";
new BaseClient(true);
