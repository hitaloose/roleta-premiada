export function pickLoseMessage(messages: string[], previousMessage?: string): string {
  if (messages.length === 1) return messages[0];

  let message = messages[Math.floor(Math.random() * messages.length)];
  while (message === previousMessage) {
    message = messages[Math.floor(Math.random() * messages.length)];
  }
  return message;
}
