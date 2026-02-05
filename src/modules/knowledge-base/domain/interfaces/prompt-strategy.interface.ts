export interface PromptStrategy {
    name: string;
    description: string;

    /**
     * Generates the system prompt (instructions) for the LLM.
     * @param options Optional configuration for the prompt
     */
    getSystemPrompt(options?: any): string;

    /**
     * Generates the user prompt (content/context) for the LLM.
     * @param context The main context (e.g., PDF text) to process
     * @param options Optional configuration for the prompt
     */
    getUserPrompt(context: string, options?: any): string;
}
