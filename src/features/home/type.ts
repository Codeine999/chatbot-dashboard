export interface IAiChatbot {
    id: number;
    role: 'user' | 'ai';
    content: string;
}

export type ActivityTone = 'green' | 'indigo' | 'purple' | 'blue' | 'orange';

export type ActivityType =
    | 'webhook'
    | 'richMenu'
    | 'broadcast'
    | 'profile'
    | 'welcome';

export type RecentActivityItem = {
    id: string;
    type: ActivityType;
    tone: ActivityTone;
    title: string;
    description: string;
    time: string;
};
