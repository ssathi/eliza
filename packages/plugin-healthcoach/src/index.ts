import type { Plugin } from "@elizaos/core";
import { noneAction } from "./actions/none.ts";
import { goalEvaluator } from "./evaluators/goal.ts";
import { timeProvider } from "./providers/time.ts";
import { chooseTweet, generateTweet, postTweet, searchTweets } from "./actions";

export * as actions from "./actions";
export * as evaluators from "./evaluators";
export * as providers from "./providers";

export const healthcoachPlugin: Plugin = {
    name: "healthcoach",
    description: "Agent Healthcoach actions and providers",
    actions: [
        noneAction,
        searchTweets,
        chooseTweet,
        postTweet,
        generateTweet,
    ],
    evaluators: [],
    providers: [],
};
export default healthcoachPlugin;
