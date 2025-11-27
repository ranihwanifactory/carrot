import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const enhanceDescription = async (title: string, rawDetails: string, category: string): Promise<string> => {
  if (!apiKey) {
    console.warn("No API Key found for Gemini");
    return "자세한 설명을 입력해주세요.";
  }

  try {
    const prompt = `
      당신은 한국 최고의 중고거래 앱 '당근'의 전문 에디터입니다.
      아래 물건에 대해 구매자가 읽고 싶어하는 매력적이고 친절한 한국어 판매글을 작성해주세요.
      
      물건 이름: ${title}
      카테고리: ${category}
      사용자 입력 정보: ${rawDetails}
      
      규칙:
      1. 150자 이내로 간결하게 작성하세요.
      2. 이모지를 적절히 사용하여 친근감을 주세요.
      3. 물건의 상태와 장점을 자연스럽게 강조하세요.
      4. 오직 판매글 본문 내용만 반환하세요 (인사말이나 부가 설명 제외).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || rawDetails;
  } catch (error) {
    console.error("Error generating description:", error);
    return rawDetails;
  }
};

export const suggestPrice = async (title: string, category: string): Promise<string> => {
    if (!apiKey) return "";
    
    try {
        const prompt = `한국 중고거래 시장 기준, "${category}" 카테고리의 "${title}" 적정 중고 시세를 알려주세요.
        결과는 오직 가격 범위만 출력하세요 (예: "10,000원 ~ 15,000원").`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text;
    } catch (e) {
        return "";
    }
}