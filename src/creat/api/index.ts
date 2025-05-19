export async function translateToEnglish(text: string): Promise<string> {
  const response = await fetch(
    `https://translate.appworlds.cn?text=${encodeURIComponent(text)}&from=zh-CN&to=en`,
  );
  const data = await response.json();
  if (data.code === 200) {
    return data.data;
  }
  throw new Error(`Translation failed: ${data.msg}`);
}
