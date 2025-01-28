import { UUID } from "@elizaos/core";

export interface TweetId {
    id: string;
    text: string;
    views: number;
}

export interface SelectedTweet {
    id: string;
    username: string;
    text: string;
    views: number;
    roomId: UUID;
}

export interface PromptResponse {
    tweet: string;
    topic: string;
    theme: string;
    templateId: string;
    structure: string;
    rationale: string;
}
