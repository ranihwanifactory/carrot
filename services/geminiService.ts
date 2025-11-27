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
      당신은 '당근마켓'과 같은 중고거래 앱의 전문 카피라이터입니다.
      다음 물건에 대해 친근하고 신뢰가 가는 한국어 상품 설명을 작성해주세요:
      
      물건: ${title}
      카테고리: ${category}
      제공된 상세 정보: ${rawDetails}
      
      150자 이내로 작성해주세요. 적절한 이모지를 사용하세요. 물건의 가치와 상태에 집중해서 작성해주세요.
      오직 설명 텍스트만 반환해주세요.
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
        const prompt = `중고거래 앱 카테고리 "${category}"에 있는 중고 "${title}"의 적정 중고 시세를 한국 원화(KRW) 기준으로 추정해주세요.
        오직 가격 범위 문자열만 반환해주세요 (예: "10,000원 - 15,000원"). 짧게 답변해주세요.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text;
    } catch (e) {
        return "";
    }
}