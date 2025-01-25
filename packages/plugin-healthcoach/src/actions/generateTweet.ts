import type {
    ActionExample,
    IAgentRuntime,
    Memory,
    Action,
    HandlerCallback,
    State,
} from "@elizaos/core";
import { TweetId } from "../types";
import { composeContext, elizaLogger, generateText, ModelClass, stringToUuid } from "@elizaos/core";
import { validateTwitterConfig, TwitterConfig } from "../base/environment";
import { ClientBase } from "../base/base";
import { SearchMode } from "agent-twitter-client";



const twitterPostTemplate = `
# Areas of Expertise
{{knowledge}}

# About {{agentName}} (@{{twitterUserName}}):
{{bio}}
{{lore}}
{{topics}}

{{providers}}

{{characterPostExamples}}

{{postDirections}}

# Task: Generate a post in the voice and style and perspective of {{agentName}} @{{twitterUserName}}.
Write a post that is {{adjective}} about {{topic}} (without mentioning {{topic}} directly), from the perspective of {{agentName}}. Do not add commentary or acknowledge this request, just write the post.
Your response should be 1, 2, or 3 sentences (choose the length at random).
Your response should not contain any questions. Brief, concise statements only. The total character count MUST be less than {{maxTweetLength}}. No emojis.`;


export const generateTweet: Action = {
    name: "GENERATE_TWEET",
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

        const twitterConfig: TwitterConfig = await validateTwitterConfig(_runtime);

        const topics = _runtime.character.topics.join(", ");

        const roomId = stringToUuid(
            "twitter_generate_room-" + twitterConfig.TWITTER_USERNAME
        );

        const state = await _runtime.composeState(
            {
                userId: _runtime.agentId,
                roomId: roomId,
                agentId: _runtime.agentId,
                content: {
                    text: topics || "",
                    action: "GENERATE_TWEET",
                },
            },
            {
                twitterUserName: twitterConfig.TWITTER_USERNAME,
            }
        );

        const context = composeContext({
            state,
            template:
                _runtime.character.templates?.twitterPostTemplate ||
                twitterPostTemplate,
        });

        elizaLogger.info('generate text context', context);

        const generatedTweet = await generateText({
            runtime: _runtime,
            context: context,
            modelClass: ModelClass.LARGE,
        });

        elizaLogger.info('result', generatedTweet);

        _callback({text: 'generateTweetResponse', generatedTweet})
    },
    examples: [] as ActionExample[][],
} as Action;
