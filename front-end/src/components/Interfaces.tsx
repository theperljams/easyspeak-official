// export interface Message {
//   message: string;
//   side: 'left' | 'right';
// }

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}