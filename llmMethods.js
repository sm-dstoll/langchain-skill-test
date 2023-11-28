/* eslint-disable import/prefer-default-export */
/* eslint-disable no-unused-vars */
import { PromptTemplate } from 'langchain/prompts';
import {
  RunnableSequence,
  RunnablePassthrough,
} from 'langchain/schema/runnable';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { StringOutputParser } from 'langchain/schema/output_parser';
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { HtmlToTextTransformer } from 'langchain/document_transformers/html_to_text';
import 'dotenv/config';

const model = new ChatOpenAI({
  openAIApiKey: process.env.OPEN_AI_API_KEY,
});

const condenseQuestionTemplate = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;
const CONDENSE_QUESTION_PROMPT = PromptTemplate.fromTemplate(
  condenseQuestionTemplate,
);

const answerTemplate = `Answer the question based only on the following context:
{context}

Question: {question}
`;
const ANSWER_PROMPT = PromptTemplate.fromTemplate(answerTemplate);

const combineDocumentsFn = (docs, separator = '\n\n') => {
  console.log({ docs });
  const serializedDocs = docs.map((doc) => doc.pageContent);
  return serializedDocs.join(separator);
};

const formatChatHistory = (chatHistory) => {
  const formattedDialogueTurns = chatHistory.map(
    (dialogueTurn) => `Human: ${dialogueTurn[0]}\nAssistant: ${dialogueTurn[1]}`,
  );
  return formattedDialogueTurns.join('\n');
};

export const loadDocuments = async () => {
  console.log('howdy');
  const loader1 = new CheerioWebBaseLoader(
    'https://docs.soulmachines.com/skills-api',
    {
      selector: 'article',
    },
  );
  const loader2 = new CheerioWebBaseLoader(
    'https://docs.soulmachines.com/skills-api/guides/memory',
    {
      selector: 'article',
    },
  );
  const docs1 = await loader1.load();
  const docs2 = await loader2.load();
  const docs = [...docs1, ...docs2];

  const splitter = RecursiveCharacterTextSplitter.fromLanguage('html');
  const transformer = new HtmlToTextTransformer();

  const sequence = splitter.pipe(transformer);
  const newDocuments = await sequence.invoke(docs);
  const obj = Object.fromEntries(newDocuments);
  console.log({ obj });
  return newDocuments;
};

loadDocuments();
