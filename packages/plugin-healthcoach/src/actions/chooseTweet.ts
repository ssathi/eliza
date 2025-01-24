import type {
    ActionExample,
    IAgentRuntime,
    Memory,
    Action,
    HandlerCallback,
    State,
} from "@elizaos/core";
import { composeContext, elizaLogger, generateText, ModelClass, stringToUuid } from "@elizaos/core";
import { TwitterConfig, validateTwitterConfig } from "../base/environment";


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

# Most engaging tweets found online right now
{{tweetList}}

# Task: Choose a tweet that suits your expert area
choose one tweet id. only id no text.

`

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
                    action: "CHOOSE_TWEET",
                },
            },
            {
                twitterUserName: twitterConfig.TWITTER_USERNAME,
                tweetList: JSON.stringify(_message.content.tweetList)
            }
        );

        const context = composeContext({
            state,
            template:
                _runtime.character.templates?.twitterPostTemplate ||
                twitterPostTemplate,
        });

        elizaLogger.info('generate text context', context);

        const choosenTweetId = await generateText({
            runtime: _runtime,
            context: context,
            modelClass: ModelClass.SMALL,
        });

        const tweetId = choosenTweetId.trim();

        _callback({text: 'searchTweetsResponse', tweetId})
    },
    examples: [] as ActionExample[][],
} as Action;
