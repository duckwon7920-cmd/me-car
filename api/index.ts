// Vercel에서 실행되는 AI API. server.ts의 API 부분과 같은 내용입니다.
// 화면(dist)은 Vercel이 제공하므로 여기서는 /api 요청만 처리합니다.
import express, { Request, Response } from 'express';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

// Initialize Google GenAI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function callGeminiWithRetry(params: any, retries = 2, delayMs = 1200): Promise<any> {
  try {
    return await ai.models.generateContent(params);
  } catch (err: any) {
    const msg = String(err?.message || '');
    const is503 = msg.includes('503') || err?.status === 503;
    const isRetryable = is503 || msg.includes('429') || err?.status === 429;

    if (retries > 0 && isRetryable) {
      await new Promise((r) => setTimeout(r, delayMs));

      // If high demand 503 on gemini-3.8-flash, attempt fast fallback to gemini-3.1-flash-lite
      if (is503 && params.model === 'gemini-3.8-flash') {
        try {
          const fallbackConfig = { ...params.config };
          delete fallbackConfig.thinkingConfig;
          return await ai.models.generateContent({
            ...params,
            model: 'gemini-3.1-flash-lite',
            config: fallbackConfig,
          });
        } catch (fallbackErr) {
          console.warn('Fallback model attempt also errored, retrying original:', fallbackErr);
        }
      }

      return callGeminiWithRetry(params, retries - 1, delayMs * 1.5);
    }
    throw err;
  }
}

const app = express();
app.use(express.json({ limit: '4mb' }));

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString(),
  });
});

// AI Vehicle Diagnosis Endpoint (Multimodal: Vision + Text)
app.post('/api/diagnose', async (req: Request, res: Response) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check your Settings > Secrets panel.',
      });
    }

    const { car, symptom, situation, image } = req.body;

    if (!symptom || typeof symptom !== 'string' || !symptom.trim()) {
      return res.status(400).json({ error: '증상 설명(symptom)을 입력해 주세요.' });
    }

    const carInfoStr = car
      ? `[차량 정보: ${car.name || '미지정'} (${car.year ? car.year + '년식' : ''}, 현재 주행거리: ${car.km ? Number(car.km).toLocaleString() + 'km' : '미지정'}, 유종: ${car.fuelType || '가솔린/디젤'}, 배기량/차급: ${car.engineSize || '일반'}, 구분: ${car.brandType || '국산'})]`
      : '[차량 정보: 일반 승용차]';

    const promptText = `당신은 25년 경력의 베테랑 1급 자동차 정비 기능장(AI 차량 진단 전문가)입니다.
한국 자동차 정비 기준(공임나라, 제조사 공식 서비스센터, 카센터 실무)에 맞추어 다음 차량의 이상 증상(및 첨부된 사진)을 정밀 분석하고 진단 보고서를 작성해 주세요.

${carInfoStr}
- 발생 상황: ${situation || '운행 중 또는 점검 시'}
- 운전자가 호소하는 이상 증상:
"""
${symptom}
"""
${image ? '- 운전자가 사진을 첨부했습니다. 사진 속의 계기판 경고등, 타이어 마모/파손, 브레이크 디스크/패드, 누유 부위, 엔진룸 부품 상태 등을 전문적으로 판독하여 visualFindings 항목에 명확히 기술해 주세요.' : '- 사진 미첨부'}

진단 시 주의사항:
1. 브레이크 제동 불능, 조향(핸들) 고착, 타이어 파손/파열 위험, 엔진 과열(오버히트), 연료/가스 누출, 연기/화재 조짐 등 안전 직결 문제는 반드시 severity를 'EMERGENCY'로 판정하고 즉시 안전 정차 및 견인 안내를 제공하세요.
2. 차량 모델 및 유종(${car?.fuelType || '일반'}, ${car?.name || ''})에 특화된 고질병이나 부품 특성(예: 디젤 DPF/EGR, 터보차저, GDI 카본 누적, 하이브리드 인버터/배터리, 전기차 감속기/냉각수, 독일 수입차 하체 부싱/오일 필터 하우징 누유 등)을 적극 반영하세요.
3. 정비소 방문 시 바가지 요금을 방지할 수 있도록 정확한 점검 요청 멘트와 예상 정비비 범위를 제시하세요.`;

    const parts: any[] = [];
    if (image && image.base64) {
      const cleanBase64 = image.base64.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: image.mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
    }
    parts.push({ text: promptText });

    const response = await callGeminiWithRetry({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        systemInstruction:
          'You are a premier master automotive mechanic in Korea. Always output valid JSON strictly matching the schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: {
              type: Type.STRING,
              description: 'One of EMERGENCY, WARNING, INSPECTION',
            },
            severityLabel: {
              type: Type.STRING,
              description: 'Short Korean title for severity e.g. 안전 우선 · 즉시 운행 중단 및 견인 권장, 조속한 정비소 방문 필요, 일반 점검 및 예방 정비',
            },
            summary: {
              type: Type.STRING,
              description: 'Comprehensive 2-3 sentence summary of the issue and core risk',
            },
            visualFindings: {
              type: Type.STRING,
              description: 'Detailed visual analysis of the uploaded photo (warning light code, wear, leaks, rust, cracks) or note that diagnosis was based on text description.',
            },
            suspectedCauses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  probability: { type: Type.NUMBER, description: 'Percentage from 10 to 95' },
                  description: { type: Type.STRING },
                  relatedPart: { type: Type.STRING },
                },
                required: ['title', 'probability', 'description', 'relatedPart'],
              },
            },
            immediateActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Step-by-step immediate safety guidelines for the driver right now',
            },
            mechanicGuide: {
              type: Type.OBJECT,
              properties: {
                checklist: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Items driver should ask the mechanic to inspect',
                },
                estimatedCostRange: {
                  type: Type.STRING,
                  description: 'Realistic Korean repair cost range (부품비+공임 포함) e.g. 8만원 ~ 15만원',
                },
                keyQuestionToAsk: {
                  type: Type.STRING,
                  description: 'Crucial question to ask the mechanic to avoid unnecessary replacement',
                },
              },
              required: ['checklist', 'estimatedCostRange', 'keyQuestionToAsk'],
            },
            canDrive: {
              type: Type.BOOLEAN,
              description: 'Whether it is safe to continue driving to a nearby shop',
            },
          },
          required: [
            'severity',
            'severityLabel',
            'summary',
            'visualFindings',
            'suspectedCauses',
            'immediateActions',
            'mechanicGuide',
            'canDrive',
          ],
        },
      },
    });

    const responseText = response.text || '{}';
    const parsed = JSON.parse(responseText);
    res.json(parsed);
  } catch (err: any) {
    console.error('Diagnosis error:', err);
    res.status(500).json({
      error: err.message || '차량 증상 진단 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    });
  }
});

// AI Follow-up Chat for Diagnosis
app.post('/api/diagnose/chat', async (req: Request, res: Response) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const { car, originalDiagnosis, history, message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: '질문 메시지를 입력해 주세요.' });
    }

    const contextPrompt = `당신은 친절하고 전문적인 1급 정비 기능장입니다.
현재 사용자의 차량: ${car ? `${car.name} (${car.year}년식, ${Number(car.km || 0).toLocaleString()}km)` : '일반 차량'}
이전 진단 내용 요약: ${originalDiagnosis ? JSON.stringify(originalDiagnosis).slice(0, 1000) : '이전 진단 기록 없음'}

운전자의 후속 질문에 대해 정비사 입장에서 친절하고 실용적으로 답변하세요.
위험성, 정비 요령, 공임 절약 팁, 부품 직구 여부, 운행 가능 여부 등을 알기 쉽게 한국어로 답변하세요. 불필요한 서론은 줄이고 핵심 위주로 명쾌하게 답하세요.`;

    const messagesFormatted: any[] = [];
    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        messagesFormatted.push({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.content }],
        });
      }
    }
    messagesFormatted.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await callGeminiWithRetry({
      model: 'gemini-3.8-flash',
      contents: messagesFormatted,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        systemInstruction: contextPrompt,
      },
    });

    res.json({ reply: response.text || '' });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message || '답변 생성 중 오류가 발생했습니다.' });
  }
});

// AI Vehicle-Specific Dynamic Estimate Generation
app.post('/api/estimate-ai', async (req: Request, res: Response) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const { car } = req.body;
    const carName = car?.name || '현대 쏘나타';
    const carYear = car?.year || 2020;
    const carKm = car?.km || 50000;
    const fuelType = car?.fuelType || '가솔린';
    const brandType = car?.brandType || '국산 일반';

    const prompt = `차량: "${carName}" (${carYear}년식, 유종: ${fuelType}, 분류: ${brandType}, 현재 주행거리: ${Number(carKm).toLocaleString()}km)에 대하여,
실제 한국 자동차 정비 시장(공임나라 표준 공임표, 모비스 정품 및 OEM 호환 부품, 수입차 전문 공임) 기준에 맞는 소모품별 정밀 정비 견적 및 공임 데이터를 산출해 주세요.

주의 조건:
1. 차종에 따른 정확한 단가 반영:
   - 국산 경차/소형차: 부품비 및 공임비가 가장 저렴.
   - 국산 중형/SUV: 대용량 엔진오일, 17~19인치 타이어 등 표준 단가.
   - 제네시스/국산 대형 고급차: 6기통 이상 고용량 엔진오일, 19~21인치 타이어, 전자식 EPB/브렘보 패드, AGM 대용량 배터리, 고급 공임 적용.
   - 독일/수입차(BMW, 벤츠, 아우디 등): 수입차 전용 공임 할증(공임나라 기준 1.5~2배 이상), 수입차 전용 필터/오일 규격, 패드 센서, AGM 코딩 공임 적용.
   - 순수 전기차(EV: 테슬라, 아이오닉, EV6 등): 엔진오일, 점화플러그를 완전히 제외하고, 대신 감속기 오일, 절연형 냉각수/부동액, EV 전용 고하중 타이어를 포함하세요!
2. 각 항목의 금액은 최소값과 최대값(정품 vs 호환품, 일반 카센터 vs 전문점/공식센터 차이)을 원화(KRW) 정수로 제공하세요.
3. 추천 부품 브랜드/스펙과 교체 주기(km 및 개월수), 정비 팁을 차량에 맞게 정확히 작성하세요.`;

    const response = await callGeminiWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        systemInstruction:
          'You are an authoritative automotive pricing specialist in South Korea. Return strictly JSON matching the schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            carSummary: {
              type: Type.STRING,
              description: 'Brief overview of this vehicle maintenance characteristics and pricing tier',
            },
            overallTier: {
              type: Type.STRING,
              description: 'e.g. 국산 보급형, 국산 중대형, 국산 프리미엄, 수입 프리미엄, 순수 전기차 EV',
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: '소모품 항목명 (예: 엔진오일 세트, 타이어, 브레이크 패드 등)' },
                  icon: { type: Type.STRING, description: 'Emoji icon' },
                  unit: { type: Type.STRING, description: '예: 1회 교환, 1본(개당), 전륜 1축, 4개 세트' },
                  partCostMin: { type: Type.INTEGER },
                  partCostMax: { type: Type.INTEGER },
                  laborCostMin: { type: Type.INTEGER },
                  laborCostMax: { type: Type.INTEGER },
                  recommendedIntervalKm: { type: Type.INTEGER },
                  recommendedIntervalMonths: { type: Type.INTEGER },
                  brandRecommendation: { type: Type.STRING, description: '추천 부품 브랜드 및 규격' },
                  difficulty: { type: Type.STRING, description: 'DIY 가능, 일반 정비소, 전문 장비 필요 중 하나' },
                  tip: { type: Type.STRING, description: '해당 차종 전용 팁 및 유의사항' },
                },
                required: [
                  'name',
                  'icon',
                  'unit',
                  'partCostMin',
                  'partCostMax',
                  'laborCostMin',
                  'laborCostMax',
                  'recommendedIntervalKm',
                  'recommendedIntervalMonths',
                  'brandRecommendation',
                  'difficulty',
                  'tip',
                ],
              },
            },
          },
          required: ['carSummary', 'overallTier', 'items'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Estimate error:', err);
    res.status(500).json({ error: err.message || '견적 산출 중 오류가 발생했습니다.' });
  }
});

export default app;
