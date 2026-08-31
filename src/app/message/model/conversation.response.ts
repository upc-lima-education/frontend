export class ConversationResponse {
    id: string;
    title: string;
    subtitle: string;
    userImage?: string;
    unreadCount: number;
    jobId?: string;
    participantIds: string[];
    createdAt?: string;
    lastMessage?: string;
    lastMessageTime?: Date;

    constructor(
        id: string,
        unreadCount: number,
        title: string,
        subtitle: string,
        userImage?: string,
        jobId?: string,
        participantIds: string[] = [],
        createdAt?: string,
        lastMessage?: string,
        lastMessageTime?: Date,
    ){
        this.id = id;
        this.unreadCount = unreadCount;
        this.title = title;
        this.subtitle = subtitle;
        this.userImage = userImage;
        this.jobId = jobId;
        this.participantIds = participantIds;
        this.createdAt = createdAt;
        this.lastMessage = lastMessage;
        this.lastMessageTime = lastMessageTime;
    }
}
