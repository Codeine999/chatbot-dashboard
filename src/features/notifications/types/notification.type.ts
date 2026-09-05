/**
 * Mirror of `notificationMetadataSchema` on the API.
 *
 * The API no longer joins LineConversation into a notification — everything the
 * dashboard needs is snapshotted here at the moment the notification fires.
 * `conversationId` is what makes a notification clickable: it is the id passed
 * to /chat/line to open that customer's thread.
 *
 * Every field is optional because the API parses old rows leniently and sends
 * `metadata: null` for anything it cannot read.
 */
export type NotificationMetadata = {
  conversationId?: string | null;
  displayName?: string | null;
  pictureUrl?: string | null;
  lastMessage?: string | null;
  flow?: string | null;
  step?: string | null;
  status?: string | null;
};

export type AdminNotification = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  userId: string | null;
  isRead: boolean;
  createdAt: string;
  metadata: NotificationMetadata | null;
};
