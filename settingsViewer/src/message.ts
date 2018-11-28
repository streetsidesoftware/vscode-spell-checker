
export type Commands = 'UpdateCounter';

export interface Message {
  command: Commands;
}

export interface UpdateCounterMessage extends Message {
  command: 'UpdateCounter';
  value: number;
}

export function isMessage(data: any): data is Message {
  return data && typeof data === 'object' && data.hasOwnProperty('command');
}

export function isUpdateCounterMessage(msg: Message): msg is UpdateCounterMessage {
  return msg.command === 'UpdateCounter';
}
