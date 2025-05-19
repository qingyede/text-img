export function isPureEnglish(text: string): boolean {
  // 允许字母、数字、常用标点和空格
  return /^[a-zA-Z0-9\s.,!?'"()\-:;]*$/.test(text.trim());
}
