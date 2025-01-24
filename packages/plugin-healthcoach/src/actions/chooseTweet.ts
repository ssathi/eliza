import type {
    ActionExample,
    IAgentRuntime,
    Memory,
    Action,
    HandlerCallback,
    State,
} from "@elizaos/core";
import { elizaLogger, generateText, ModelClass } from "@elizaos/core";

export const chooseTweet: Action = {
    name: "CHOOSE_TWEET",
    similes: [],
    validate: async (_runtime: IAgentRuntime, _message: Memory) => {
        return true;
    },
    description:
        "Seach twitter for given topics and return a list of tweets and ids",
    handler: async (
        _runtime: IAgentRuntime,
        _message: Memory,
        _state?: State,
        _options?: { [key: string]: unknown },
        _callback?: HandlerCallback,
    ): Promise<void> => {

        elizaLogger.info('choose most suitable tweet')

        const prompt = '';

        const mostInterestingTweetResponse = await generateText({
            runtime: _runtime,
            context: prompt,
            modelClass: ModelClass.SMALL,
        });

        const tweetId = mostInterestingTweetResponse.trim();

        _callback({text: 'searchTweetsResponse', tweetId})
    },
    examples: [] as ActionExample[][],
} as Action;
