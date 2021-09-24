# strappy

Strappy is an extensible bootstrap node for [Free Food](https://github.com/noahlevenson/libfood). 

If you want to support the [Free Food](https://github.com/noahlevenson/libfood) mainline by operating a bootstrap node &mdash; or if you want to spin up your own private network running the [Free Food](https://github.com/noahlevenson/libfood) protocol &mdash; Strappy is the right place to start. Watch the Strappy tutorial video (above) to learn the basics.

### :heavy_check_mark: Requirements

Node.js (tested on v14.17.6)

### :100: Usage

1. Clone Strappy.

`git clone https://github.com/noahlevenson/strappy`

2. Clone libfood into the Strappy directory.

`git clone https://github.com/noahlevenson/libfood strappy/libfood`

3. Configure Strappy by copying Strappy's `libfood.json` to the libfood install.

`cp strappy/libfood.json strappy/libfood`

4. Configure Strappy.

`node strappy/tools/strappygen`

5. Generate secrets for the new network.

`node strappy/tools/netgen`

6. Run Strappy.

`node strappy/src/strappy`