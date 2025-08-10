export interface IAiChatbot {
    id: number;
    role: 'user' | 'ai';
    content: string;
}
