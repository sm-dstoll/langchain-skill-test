/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
import yargs from 'yargs';
import express from 'express';
import bodyParser from 'body-parser';
import { loadDocuments } from './llmMethods';

import 'dotenv/config';
// const docs3 = await loadDocuments();
// console.log({ docs3 })

const router = express.Router();
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

router.get('/', (req, res) => {
  console.log(req);
  res.send('successfully connected');
});

router.post(
  '/session',
  async (request, response, next) => {
    console.log(`session Request: ${JSON.stringify(request.body)}`);
    const sessionRequest = request.body;
    const sessionResponse = await sessionHandler(sessionRequest);
    response.setHeader('Content-Type', 'application/json');
    response.send(sessionResponse);
  },
);

router.post(
  '/execute',
  async (request, response, next) => {
    const executeRequest = request.body;
    const executeResponse = await executeHandler(executeRequest);
    response.setHeader('Content-Type', 'application/json');
    response.send(executeResponse);
  },
);

app.use('/', router);

const args = yargs(process.argv.slice(2))
  .option({
    port: { type: 'number', default: 4000, describe: 'Port to serve on' },
  })
  .help()
  .parseSync();

app.listen(args.port, () => {
  console.log(`Soul Machines Skill started on port ${args.port}.`);
});

async function sessionHandler(req) {
  console.log('SESSION HANDLER');
  const docs = await loadDocuments();
  console.log({ docs });
  const resp = {
    output: {},
    memory: [docs],
    endConversation: false,
    endRouting: false,
  };
  return resp;
}

async function executeHandler(req) {
  console.log('EXECUTE HANDLER');
  console.log({ req });
  const { text, memory } = req;
  const variables = {};
  console.log({ memory });

  const resp = {
    output: {
      text: `User said: ${text}`,
      variables,
    },
    memory,
    endConversation: false,
    endRouting: false,
  };
  return resp;
}
