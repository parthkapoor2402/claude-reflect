const { createGroqClient } = require('../../utils/groq');

function mockGroqCompletion(jsonPayload) {
  const content =
    typeof jsonPayload === 'string' ? jsonPayload : JSON.stringify(jsonPayload);

  createGroqClient.mockReturnValue({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content } }],
        }),
      },
    },
  });
}

function mockGroqChatStream(chunks) {
  const stream = {
    async *[Symbol.asyncIterator]() {
      for (const text of chunks) {
        yield { choices: [{ delta: { content: text } }] };
      }
    },
  };

  createGroqClient.mockReturnValue({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue(stream),
      },
    },
  });
}

function mockGroqChatError(message = 'Groq API error') {
  createGroqClient.mockReturnValue({
    chat: {
      completions: {
        create: jest.fn().mockRejectedValue(new Error(message)),
      },
    },
  });
}

module.exports = {
  mockGroqCompletion,
  mockGroqChatStream,
  mockGroqChatError,
};
