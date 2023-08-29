import { ModelType } from "../store";
import { LLMApi } from "./platforms/llm/interfaces";
import { OpenAIApi } from "./platforms/llm/openai";
export {
  ROLES,
  type LLMConfig,
  type RequestMessage,
} from "./platforms/llm/interfaces";

export type ChatModel = ModelType;

export class ClientApi {
  public llm: LLMApi;

  constructor() {
    this.llm = new OpenAIApi();
  }
}

export const api = new ClientApi();
