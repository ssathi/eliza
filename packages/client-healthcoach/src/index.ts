import { type Client, elizaLogger, type IAgentRuntime } from "@elizaos/core";
import { SearchTweetsSchedular } from "./seachTweetsSchedular";
import { PostTweetsSchedular } from "./postTweetSchedular";

export const HealthcoachClientInterface: Client = {
    async start(runtime: IAgentRuntime) {
        elizaLogger.warn("Health Coach started");

         const searchSchedular = new SearchTweetsSchedular(runtime);

         searchSchedular.start();


        const postTweetSchedular = new PostTweetsSchedular(runtime);

        postTweetSchedular.start();

    },

    async stop(_runtime: IAgentRuntime) {
        elizaLogger.warn("Health Coach does not support stopping yet");
    },
};

export default HealthcoachClientInterface;
