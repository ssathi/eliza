import { elizaLogger, Memory } from "@elizaos/core";
import {
    type Content,
    type HandlerCallback,
    type IAgentRuntime,
} from "@elizaos/core";

export class SearchTweetsSchedular {
    runtime: IAgentRuntime;

    constructor(runtime: IAgentRuntime) {
        this.runtime = runtime;
    }

    async start() {
        this.engageWithSearchTermsLoop();
    }

    private engageWithSearchTermsLoop() {
        this.engageWithSearchTerms().then();
        elizaLogger.info(
            `Next twitter search scheduled in 1 minute1`
        );
        setTimeout(
            () => this.engageWithSearchTermsLoop(),
            60 * 1000
        );
    }

    private async engageWithSearchTerms() {
        elizaLogger.info("Engaging with search terms");
        try {


            const message: Memory = {
                content: {
                    action: 'SEARCH_TWEETS',
                    text: 'topics'
                },
                userId: null,
                agentId: null,
                roomId: null,
            }

            const callback: HandlerCallback = async (response: Content) => {
                elizaLogger.info('Response: ', response);
                return [];
            };

            await this.runtime.processActions(
                message,
                [message],
                null,
                callback,
            );

            elizaLogger.info('Action called')

        } catch (error) {
            console.error("Error engaging with search terms:", error);
        }
    }
}
