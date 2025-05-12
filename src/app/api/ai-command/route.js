// app/api/ai-command/route.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { command, currentData, headerInfo } = await request.json();

    // 향상된 프롬프트
    const prompt = `
당신은 Handsontable API 명령어를 생성하는 전문가입니다.

현재 스프레드시트 헤더 정보:
${headerInfo || '헤더 정보 없음'}

현재 스프레드시트 데이터 예시 (처음 5행):
${JSON.stringify(currentData.slice(0, 5), null, 2)}

사용자 명령: "${command}"

중요 규칙:
1. 'hot' 변수는 Handsontable 인스턴스입니다.
2. 열 인덱스는 0부터 시작합니다.
3. 헤더 정보를 정확히 참고하여 적절한 열 인덱스를 사용하세요.
4. HyperFormula 수식을 사용할 때는 적절한 형식을 준수하세요.

다음 JSON 형식으로 답변해주세요:
{
  "command": "실제 실행할 Handsontable JavaScript 명령어",
  "explanation": "사용자에게 표시할 친화적인 설명",
  "steps": ["실행될 단계들의 배열"],
  "targetColumns": [사용될 열 인덱스들],
  "formula": "사용된 수식 (있는 경우)"
}

예시:
{
  "command": "hot.getPlugin('columnSorting').sort({column: 1, sortOrder: 'desc'});",
  "explanation": "키(height) 열을 내림차순으로 정렬합니다.",
  "steps": ["2번 열(height) 찾기", "내림차순 정렬 적용"],
  "targetColumns": [1],
  "formula": null
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 600
    });

    const result = JSON.parse(response.choices[0].message.content);

    return Response.json({
      ...result,
      success: true
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({
      success: false,
      error: error.message,
      explanation: "명령어 처리 중 오류가 발생했습니다."
    }, { status: 500 });
  }
}
