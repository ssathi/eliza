import type {
    ActionExample,
    IAgentRuntime,
    Memory,
    Action,
    HandlerCallback,
    State,
} from "@elizaos/core";
import { elizaLogger, stringToUuid } from "@elizaos/core";
import { validateTwitterConfig, TwitterConfig } from "../base/environment";
import { ClientBase } from "../base/base";
import { SearchMode } from "agent-twitter-client";

export const searchTweets: Action = {
    name: "SEARCH_TWEETS",
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

        const searchTerm = [..._runtime.character.topics][
            Math.floor(Math.random() * _runtime.character.topics.length)
        ];

         elizaLogger.info("Fetching search tweets for topcis", searchTerm);

         const twitterConfig: TwitterConfig = await validateTwitterConfig(_runtime);

         const roomId = stringToUuid(
            "twitter_generate_room-" + twitterConfig.TWITTER_USERNAME
        );

         const client = new ClientBase(_runtime, twitterConfig);
         client.init();

        // TODO: we wait 5 seconds here to avoid getting rate limited on startup, but we should queue
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const recentTweets = await client.fetchSearchTweets(
            searchTerm,
            20,
            SearchMode.Latest
        );

        const tweetList = recentTweets.tweets.map(tweet => ({
            text: tweet.text,
            id: tweet.id,
            views: tweet.views,
            username: tweet.username,
            roomId: roomId,
            timestamp: tweet.timestamp as number
        }));

        _callback({text: 'searchTweetsResponse', tweetList})
    },
    examples: [] as ActionExample[][],
} as Action;
