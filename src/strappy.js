const vm = require("vm");
const fs = require("fs");
const network_secrets = require("../network.secret.json");
const strappy_secrets = require("../strappy.secret.json");
const { Fapp } = require("../libfood/src/fapp/fapp.js");
const { Fid_pub } = require("../libfood/src/fid/fid_pub.js");
const { Fid_prv } = require("../libfood/src/fid/fid_prv.js");
const { Fcrypto } = require("../libfood/src/fcrypto/fcrypto.js");
const { Flog } = require("../libfood/src/flog/flog.js");

const STARTUP_SCRIPT_PATH = "../startup/strappy.startup.js";

/**
 * The startup script is Strappy's convention for executing additional code at startup time.
 * If a JavaScript file is found at STARTUP_SCRIPT_PATH, Strappy will execute it after bootstrapping.
 * The startup script is executed in a Node.js VM, so any require statements must reference paths
 * relative to this source file. The following local objects are exposed to the startup script: 
 * fapp (Strappy's Fapp instance)
 * strappy_pub (Strappy's Fid_pub object)
 * Flog (Strappy's Flog object, use Flog.log as normal)
 */

(async () => {
  // TODO: Validate network.secret.json and strappy.secret.json

  const startup_file_exists = fs.existsSync(STARTUP_SCRIPT_PATH);
  Flog.log(`[STRAPPY] ${startup_file_exists ? "Startup script found, I hope it's valid JS!" : 
    "No startup script found!"}`);

  const strappy_pub = new Fid_pub({
    pubkey: strappy_secrets.PUBKEY,
    name: strappy_secrets.NAME,
    address: strappy_secrets.ADDRESS,
    lat: strappy_secrets.LAT,
    long: strappy_secrets.LONG
  });

  strappy_pub.nonce = strappy_secrets.NONCE;
  strappy_prv = new Fid_prv({privkey: strappy_secrets.ENCRYPTED_PRIVKEY});
 
  const privkey = await Fcrypto.decrypt_private_key(
    Buffer.from(strappy_prv.privkey, "hex"), 
    strappy_secrets.PASSWORD
  );

  Fcrypto.set_privkey_func(() => {
    return new Promise((resolve, reject) => {
        resolve(privkey);
    });
  });

  const fapp = new Fapp({
    fid_pub: strappy_pub, 
    fid_prv: strappy_prv, 
    is_keyserver_validator: strappy_secrets.IS_KEYSERVER_VALIDATOR,
    bootstrap_nodes: network_secrets.BOOTSTRAP_NODES,
    authorities: network_secrets.AUTHORITIES
  });

  await fapp.start({addr: strappy_secrets.PUBLIC_HOST, port: strappy_secrets.PUBLIC_PORT});

  if (startup_file_exists) {
    const startup_js = fs.readFileSync(STARTUP_SCRIPT_PATH);
    Flog.log(`[STRAPPY] Executing startup script...`);

    vm.runInNewContext(startup_js, {
      require: require, 
      setInterval: setInterval,
      Buffer: Buffer,
      fapp: fapp,
      strappy_pub: strappy_pub, 
      Flog: Flog
    });
  }
})();
