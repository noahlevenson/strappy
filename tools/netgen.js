"use strict";

const readline = require("readline");
const fs = require("fs");
const cfg = require("../libfood.json");
const { Flog } = require("../libfood/src/flog/flog.js");

const OUTPUT_PATH = "../";
const OUTPUT_FILENAME = "network.secret.json";
const CONFIG_PATH = `${OUTPUT_PATH}${OUTPUT_FILENAME}`;

const STRAPPY_FILENAME = "strappy.secret.json";
const STRAPPY_CONFIG_PATH = `${OUTPUT_PATH}${STRAPPY_FILENAME}`;

const proto = {
  "BOOTSTRAP_NODES": [

  ],
  "AUTHORITIES": [

  ],
  "TRUSTED_ROOT_KEYS": [

  ]
};

function ask(rl, q) {
  return new Promise((resolve, reject) => {
    rl.question(q, (res) => {
      resolve(res);
    });
  });
}

(async () => {
  if (fs.existsSync(CONFIG_PATH)) {
    Flog.log(`[NETGEN] ${CONFIG_PATH} already exists!`);
    Flog.log(`[NETGEN] You must delete your existing network secrets before generating a new one.`);
    Flog.log(`[NETGEN] Exiting...`);
    return;
  }

  if (!fs.existsSync(STRAPPY_CONFIG_PATH)) {
    Flog.log(`[NETGEN] ${STRAPPY_CONFIG_PATH} does not exist!`);
    Flog.log(`[NETGEN] You must generate a Strappy config before generating network secrets.`);
    Flog.log(`[NETGEN] Exiting...`);
    return;
  }

  Flog.log(`[NETGEN] Welcome to netgen, protocol vers ${cfg.PROTOCOL_VERSION}, ` + 
    `${cfg.FID_POW_ZERO_BITS}-bit POW`);

  Flog.log(`[NETGEN] Generating network secrets based on Strappy config ${STRAPPY_CONFIG_PATH}...`);

  const bootstrap = JSON.parse(fs.readFileSync(STRAPPY_CONFIG_PATH, {encoding: "utf8"}));

  proto.BOOTSTRAP_NODES.push([
    bootstrap.PUBLIC_HOST,
    bootstrap.PUBLIC_PORT,
    bootstrap.PUBKEY
  ]);

  proto.AUTHORITIES.push(bootstrap.PUBKEY);
  proto.TRUSTED_ROOT_KEYS.push(bootstrap.PUBKEY);

  Flog.log(`[NETGEN] Writing to ${CONFIG_PATH}...`);
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(proto, null, 2), {encoding: "utf8"});
  Flog.log(`[NETGEN] Done!`);
})();