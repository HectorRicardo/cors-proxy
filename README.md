# cors-proxy

A simple, local, easy-to-setup proxy server with CORS enabled. 

Runs only on HTTP (no HTTPS supported).

Use for development purposes (NOT FOR PRODUCTION).

## Installation

`npm install -g @hectorricardo/cors-proxy`

## Usage

`cors-proxy <url> [options]`

where `url` is the url of the server to be proxied.

Available options:

`-p, --port`   The port the proxy should bind to

`-h, --help`   Show help

## Example

`cors-proxy https://google.com -p 8080`

will redirect all requests matching with `http://localhost:8080/*` to `https://google.com`.

Remaining part of the url will stay the same, i.e., a request made to `http://localhost:8080/users/john` will be proxied to `https://google.com/users/john`.