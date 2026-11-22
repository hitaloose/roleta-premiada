import { brand } from '../brands';

const LOSE_MESSAGES = brand.loseMessages;

export function pickLoseMessage(previousMessage?: string): string {
  if (LOSE_MESSAGES.length === 1) return LOSE_MESSAGES[0];

  let message = LOSE_MESSAGES[Math.floor(Math.random() * LOSE_MESSAGES.length)];
  while (message === previousMessage) {
    message = LOSE_MESSAGES[Math.floor(Math.random() * LOSE_MESSAGES.length)];
  }
  return message;
}
