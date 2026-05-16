export interface MessageType {
  samples: (data: string[]) => Promise<void>
  test: () => Promise<void>
  submit: () => Promise<void>
}
