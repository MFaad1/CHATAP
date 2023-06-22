  const express = require('express');
  const cors = require('cors');
  const { Configuration, OpenAIApi } = require('openai');
  const app = express();
  const port = 3300;
  app.use(express.json());
  app.use(cors());

  const key = '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';
  const configuration = new Configuration({
    apiKey: key,
  });
  const openai = new OpenAIApi(configuration);
  app.post('/chat', async (req, res) => {
    const message = req.body.input
    try {
      const completion = await openai.createChatCompletion(
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: message },
          ],
          stream: true,
        },
        { responseType: 'stream' }
      );

      const stream = completion.data;
      stream.on('data', async(chunk) => {
        const payloads = chunk.toString().split('\n\n');
      

        for (const payload of payloads) {
          if (payload.includes('[DONE]')) return
          if (payload.startsWith('data:')) {
            const data = JSON.parse(payload.replace('data: ', ''));       
            try {
              const {content} = data.choices[0].delta || {};
              if (content) {
             
               res.write(content)
              }
            } catch (error) {
              console.log(`Error with JSON.parse and ${payload}.\n${error.message}`);
            return  res.send("error occured")
            }
          }
        }
      });

      stream.on('end', () => {
        res.end();
      });

      stream.on('error', (err) => {
        console.log(err);
        res.send(err);
      });
    } catch (errr) {
      console.log(errr)
        res.status(500).send(errr.mesage)
    }
  });



  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
