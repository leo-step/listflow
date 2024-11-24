import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI();

export type Prompt = (...args: any[]) => string;

type Role = "system" | "user";

type Type = "text";

type OpenAIMessage = {
  role: Role;
  content: Array<{
    type: "text";
    text: string;
  }>;
};

type PromptWrapper = <T extends Prompt>(
  func: T
) => (...args: Parameters<T>) => OpenAIMessage;

export const createEmbedding = async (
  input: string,
  model: string = "text-embedding-3-large",
  dimensions: number = 256
) => {
  const embedding = await openai.embeddings.create({
    model,
    input,
    encoding_format: "float",
    dimensions,
  });

  return embedding.data[0].embedding;
};

export const systemPrompt: PromptWrapper = <T extends Prompt>(
  func: T
): ((...args: Parameters<T>) => {
  role: Role;
  content: { type: Type; text: string }[];
}) => {
  return (...args: Parameters<T>) => {
    const text = func(...args);
    return {
      role: "system",
      content: [
        {
          type: "text",
          text: text,
        },
      ],
    };
  };
};

export const userPrompt: PromptWrapper = <T extends Prompt>(
  func: T
): ((...args: Parameters<T>) => {
  role: Role;
  content: { type: Type; text: string }[];
}) => {
  return (...args: Parameters<T>) => {
    const text = func(...args);
    return {
      role: "user",
      content: [
        {
          type: "text",
          text: text,
        },
      ],
    };
  };
};

export const getOpenAIJsonResponse = async <T>(
  messages: OpenAIMessage[],
  model: string = "gpt-4o-mini",
  temp: number = 1,
  maxTokens: number = 1024
) => {
  const response = await openai.chat.completions.create({
    model,
    messages,
    response_format: { type: "json_object" },
    temperature: temp,
    max_tokens: maxTokens,
  });

  const content = response.choices[0].message.content;

  if (!content) {
    return null;
  }

  return JSON.parse(content) as T;
};
