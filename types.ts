
export interface Position {
  x: number;
  y: number;
}

export enum AppState {
  ASking = 'ASKING',
  ACCEPTED = 'ACCEPTED',
  GENERATING_RESPONSE = 'GENERATING_RESPONSE'
}

export interface ValentineMessage {
  reason: string;
  poem: string;
}
