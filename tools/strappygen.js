"use strict";

const readline = require("readline");
const fs = require("fs");
const cfg = require("../libfood.json");
const { Fapp } = require("../../libfood/src/fapp/fapp.js");
const { Fid } = require("../../libfood/src/fid/fid.js");
const { Fid_pub } = require("../../libfood/src/fid/fid_pub.js");
const { Flog } = require("../../libfood/src/flog/flog.js");

const OUTPUT_FILENAME = "strappy.secret.json";

const proto = {
  "PUBLIC_HOST": null,
  "PUBLIC_PORT": 27500,
  "NAME": "STRAPPY DEFAULT",
  "ADDRESS": "STRAPPY DEFAULT",
  "LAT": 0,
  "LONG": 0,
  "PUBKEY": undefined,
  "ENCRYPTED_PRIVKEY": undefined,
  "NONCE": undefined,
  "PASSWORD": null,
  "IS_KEYSERVER_VALIDATOR": true
};

function ask(rl, q) {
  return new Promise((resolve, reject) => {
    rl.question(q, (res) => {
      resolve(res);
    });
  });
}

(async () => {
  Flog.log(`[STRAPPYGEN] Welcome to strappygen, protocol vers ${cfg.PROTOCOL_VERSION}, ` + 
    `${cfg.FID_POW_ZERO_BITS}-bit POW`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  for (const key of Object.keys(proto)) {
    if (proto[key] === null) {
      proto[key] = await ask(rl, ` ${key}: `);
    }
  }

  rl.close();
  Flog.log(`[STRAPPYGEN] Generating keypair...`);
  const pair = await Fapp.generate_key_pair(proto.PASSWORD);

  const cert = new Fid_pub({
    pubkey: pair.publicKey,
    name: proto.NAME,
    address: proto.ADDRESS,
    lat: proto.LAT,
    long: proto.LONG,
  });

  Flog.log(`[STRAPPYGEN] Generating ${cfg.FID_POW_ZERO_BITS}-bit POW...`);
  const pow_cert = await Fid.find_partial_preimage(cert, Fid_pub.inc_nonce, cfg.FID_POW_ZERO_BITS);
  
  proto.PUBKEY = pair.publicKey;
  proto.ENCRYPTED_PRIVKEY = pair.privateKey;
  proto.NONCE = pow_cert.nonce;

  Flog.log(`[STRAPPYGEN] Writing to ${OUTPUT_FILENAME}...`);
  fs.writeFileSync(OUTPUT_FILENAME, JSON.stringify(proto, null, 2), {encoding: "utf8"});
  Flog.log(`[STRAPPYGEN] Done!`);
})();