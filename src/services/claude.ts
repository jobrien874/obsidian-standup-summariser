import { requestUrl } from 'obsidian';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MAX_TOKENS = 2048;

const SUMMARY_PROMPT = `You are helping a programmer create a stand-up summary. Based on the notes and git commits below, create a concise summary of what was accomplished today. Focus on:

1. Main tasks and projects worked on
2. Key decisions or insights
3. Problems solved or encountered
4. Progress made
5. Any action items or next steps

Format the summary in a clear, organized way using markdown.`;

export async function callClaudeAPI(
  context: string,
  apiKey: string,
  model: string
): Promise<string> {
  const requestBody = buildRequestBody(model, context);
  const response = await sendRequest(apiKey, requestBody);

  handleErrorResponse(response, model);

  return extractTextFromResponse(response);
}

function buildRequestBody(model: string, context: string) {
  return {
    model,
    max_tokens: MAX_TOKENS,
    messages: [
      {
        role: 'user',
        content: `${SUMMARY_PROMPT}\n\n${context}\n\nPlease provide a comprehensive but concise stand-up summary.`
      }
    ]
  };
}

async function sendRequest(apiKey: string, requestBody: any) {
  try {
    const response = await requestUrl({
      url: CLAUDE_API_URL,
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify(requestBody),
      throw: false,
    });

    return response;
  } catch (error: any) {
    console.error('Error calling Claude API:', error);
    console.error('Error type:', typeof error);
    console.error('Error properties:', Object.keys(error));

    if (error.status) {
      console.error('Error status:', error.status);
    }

    if (error instanceof Error) {
      if (error.message.includes('404') || error.message.includes('401') || error.message.includes('400')) {
        throw error;
      }
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
    throw new Error('Failed to generate summary: Unknown error');
  }
}

function handleErrorResponse(response: any, model: string): void {
  if (response.status === 200) return;

  const errorData = response.json || response.text;
  console.error('API error response:', errorData);

  const errorMessages: Record<number, string> = {
    404: `404 Not Found - Model not available. Current model: "${model}". Try: claude-sonnet-4-20250514, claude-3-5-sonnet-20240620, or claude-3-opus-20240229. Error: ${JSON.stringify(errorData)}`,
    401: '401 Unauthorized - Invalid API key. Please check your Anthropic API key in settings.',
    400: `400 Bad Request - ${JSON.stringify(errorData)}`,
  };

  const errorMessage = errorMessages[response.status] || `API returned ${response.status}: ${JSON.stringify(errorData)}`;
  throw new Error(errorMessage);
}

function extractTextFromResponse(response: any): string {
  const data = response.json;
  if (!data.content || !Array.isArray(data.content)) {
    console.error('Invalid response structure:', data);
    throw new Error('Invalid response format from API');
  }

  const textContent = data.content.find((block: any) => block.type === 'text');

  if (!textContent) {
    console.error('No text content found in response:', data.content);
    throw new Error('No text content in API response');
  }

  return textContent.text;
}
