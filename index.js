#!/usr/bin/env node

const setCookieSerializer = require('cookie');
const cors = require('cors');
const express = require('express');
const proxy = require('http-proxy-middleware');
const morgan = require('morgan');
const setCookieParser = require('set-cookie-parser');
const yargs = require('yargs');

const DEFAULT_PORT_NUMBER = 3003;

/**
 * READ THIS BEFORE:
 *
 * There are 3 entities in play here:
 * 1) The client
 * 2) The proxy
 * 3) The target server.
 *
 * The proxy acts as a mediator between the client and the target server. It receives requests from
 * the client and forwards them to the server. The server receives the request, processes it, and
 * returns it back to the proxy. The proxy then forwards the response to the client.
 *
 * By doing this, the proxy can intercept and modify the requests and responses as needed. This
 * process is completely transparent to the client.
 *
 * This is a basic architecture diagram:
 */
/* eslint-disable max-len */
/*
 *  ----------                                        ---------                                         ----------
 * |          | Client sends request A               |         |  Proxy sends request A'               |          |
 * |          | ------------------------------------>|         | ------------------------------------->|          |
 * |  Client  |                                      |  Proxy  |                                       |  Server  |
 * |          | Client receives request B'           |         |  Proxy receives response B            |          |
 * |          | <----------------------------------  |         | <-------------------------------------|          |
 *  ----------                                        ----------                                        ----------
 */
/* eslint-enable max-len */
/*
 * The two modifications the proxy does to the requests and responses are the following:
 * 1) Allows cross-origin requests by responding the OPTIONS requests itself and adding or removing
 *    the necessary headers to the response from the target server.
 * 2) In case the server is communicating through https, and because the proxy is doing so through
 *    http, removes the secure attribute of the received cookies from the server so they don't get
 *    ignored by the security policies of browsers.
 */


/**
 * In case the server is communicating through https, marks the cookies as insecure so they don't
 * get ignored by browsers.
 * Remember: this proxy runs (can only run) in http.
 *
 * @param {IncomingMessage} targetResponse - the target server's response.
 */
function markCookiesAsNotSecure(targetResponse) {
  const cookiesToSet = setCookieParser.parse(targetResponse);
  const setCookieHeaders = targetResponse.headers['set-cookie'];
  cookiesToSet.forEach((cookie, idx) => {
    if (cookie.secure) {
      delete cookie.secure;
      setCookieHeaders[idx] = setCookieSerializer.serialize(cookie.name, cookie.value, cookie);
    }
  });
}

/**
 * Callback to be executed when the proxy receives a response from the target server.
 * This callback executes before the targetResponse is copied over to responseToClient.
 *
 * @param {IncomingMessage} targetResponse - the target server's response.
 */
function onProxyRes(targetResponse) {
  markCookiesAsNotSecure(targetResponse);
}

/**
 * Callback to be executed when the proxy receives a request from the client.
 *
 * @param {ClientRequest} requestToTarget - the request that will be sent to the target server.
 */
function onProxyReq(requestToTarget) {
  requestToTarget.removeHeader('Origin');
}

/**
 * Setups and starts the CORS proxy.
 *
 * @param {string} targetURL - the target url to be proxied.
 * @param {number} port - the port number in which the proxy will run.
 */
function startCorsProxy(targetURL, port) {
  // Remove url trailing slash
  const target = targetURL.replace(/\/$/, '');

  const app = express();

  // Enable CORS
  app.use(cors({
    origin: true,
    credentials: true,
  }));

  // hook morgan middleware for logging
  app.use(morgan('tiny'));

  // Set up proxy
  app.use(proxy({
    target,
    changeOrigin: true,
    onProxyReq,
    onProxyRes,
  }));

  // Start the server
  app.listen(port, () => {
    console.log(`CORS Proxy listening on http://localhost${port !== 80 ? `:${port}` : ''}`);
    console.log();
  });
}

// Yargs setup
const { argv } = yargs
  .scriptName('cors-proxy')
  .alias('h', 'help')
  .version(false)
  .strict()
  .usage('$0 <url>', 'Start the proxy', (yargs) => {
    yargs.positional('url', {
      describe: 'The url of the server to be proxied.',
      type: 'string',
    }).option('p', {
      alias: 'port',
      type: 'number',
      description: 'The port the proxy should bind to.',
      default: DEFAULT_PORT_NUMBER,
    });
  });

startCorsProxy(argv.url, argv.port);
