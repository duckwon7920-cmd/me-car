import React, { useState } from 'react';
import { Car, DiagnosisResult } from '../types';
import { SAMPLE_DIAGNOSIS_CASES } from '../data/vehiclePresets';
import {
  Bot,
  Sparkles,
  Camera,
  Upload,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  HelpCircle,
  Wrench,
  DollarSign,
  Send,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  X,
  FileCheck,
} from 'lucide-react';

interface DiagnosisTabProps {
  car: Car;
  onAddLogFromDiagnosis: (item: string, cost: number, memo: string) => void;
  onNavigateEstimate: () => void;
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export const DiagnosisTab: React.FC<DiagnosisTabProps> = ({
  car,
  onAddLogFromDiagnosis,
  onNavigateEstimate,
}) => {
  const [symptom, setSymptom] = useState('');
  const [situation, setSituation] = useState('주행 중 (시속 60~80km)');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Follow-up chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Quick symptom chips
  const quickSymptoms = [
    { label: '🛑 브레이크 쇠 긁는 소리 & 떨림', text: '브레이크를 밟을 때 날카로운 쇠 긁는 소음(끼이익)이 나고 고속에서 제동 시 핸들이 떨립니다.' },
    { label: '⚠️ 계기판 노란색 엔진 경고등 점등', text: '주행 중 계기판에 노란색 엔진 경고등(체크 엔진)이 켜졌고 가속 시 울컥거림이 있습니다.' },
    { label: '🛞 빗길 타이어 미끄러짐 & 편마모', text: '비 오는 날 맨홀이나 차선을 밟으면 차가 좌우로 미끄러지고, 타이어 바깥쪽 마모가 심합니다.' },
    { label: '🔋 시동 시 딸깍거림 & 방전 의심', text: '시동 버튼을 누르면 틱틱 딸깍거리는 소리만 나고 크랭킹이 되지 않으며 계기판 불빛이 깜빡입니다.' },
    { label: '💨 에어컨 식초 냄새 & 냉방 약함', text: '에어컨을 켜면 퀴퀴한 곰팡이/식초 냄새가 진하게 나고 바람이 시원하지 않습니다.' },
    { label: '💧 하부 바닥에 오일 누유 흔적', text: '주차한 자리에 검은색 오일 방울이 떨어져 있고, 엔진룸 쪽에서 약간의 탄 냄새가 올라옵니다.' },
  ];

  // Handle image upload from user's camera / files
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일(PNG, JPG, WEBP)을 선택해 주세요.');
      return;
    }

    setImageMime(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Load sample inspection case
  const handleLoadSample = (sample: typeof SAMPLE_DIAGNOSIS_CASES[0]) => {
    setSymptom(sample.symptom);
    setSituation(sample.situation);
    setImagePreview(sample.photoDataUrl);
    setImageMime('image/svg+xml');
    setResult(null);
    setChatMessages([]);
  };

  // Submit diagnosis request to server-side Gemini 3.8 Flash
  const handleRunDiagnosis = async () => {
    if (!symptom.trim()) {
      alert('차량에서 발생한 증상을 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setChatMessages([]);

    try {
      const payload: any = {
        car,
        symptom: symptom.trim(),
        situation,
      };

      if (imagePreview) {
        payload.image = {
          base64: imagePreview,
          mimeType: imageMime,
        };
      }

      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || '진단 중 오류가 발생했습니다.');
      }

      const data: DiagnosisResult = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '차량 진단 처리 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Send follow-up question to AI Mechanic
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    const newHistory: ChatMessage[] = [...chatMessages, { role: 'user', content: userMsg }];
    setChatMessages(newHistory);
    setChatLoading(true);

    try {
      const res = await fetch('/api/diagnose/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          car,
          originalDiagnosis: result,
          history: newHistory,
          message: userMsg,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || '답변을 불러오지 못했습니다.');
      }

      const data = await res.json();
      setChatMessages([...newHistory, { role: 'model', content: data.reply || '답변이 없습니다.' }]);
    } catch (err: any) {
      console.error(err);
      setChatMessages([
        ...newHistory,
        { role: 'model', content: `[오류] ${err.message || '답변을 가져오지 못했습니다.'}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Gemini AI 차량 증상 정밀 진단실
          </h2>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            멀티모달 비전
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          현재 등록된 <strong>{car.name} ({car.year}년식 · {car.fuelType} · {Number(car.km).toLocaleString()}km)</strong>의 제원과 고질병을 기반으로 사진과 증상을 종합 진단합니다.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        {/* Quick Symptom Chips */}
        <div>
          <span className="text-xs font-semibold text-slate-700 block mb-2">
            자주 발생하는 대표 이상 증상 (클릭 시 자동 입력):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickSymptoms.map((qs, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSymptom(qs.text)}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-left"
              >
                {qs.label}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            어떤 이상 증상이 발생했나요? <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            placeholder="예: 시속 80km로 달리다가 브레이크를 밟으면 쇠 긁는 소음이 나고 스티어링 휠이 덜덜 떨립니다. 계기판에는 별다른 경고등이 안 떴습니다."
            className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 leading-relaxed"
          />
        </div>

        {/* Situation Select */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              증상 발생 상황
            </label>
            <select
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option>주행 중 (시속 60~80km 고속)</option>
              <option>시동 직후 (냉간 시동 또는 아침)</option>
              <option>브레이크 페달 작동 시</option>
              <option>가속 페달을 깊게 밟을 때</option>
              <option>과속방지턱 / 요철 통과 시</option>
              <option>정차 및 신호 대기 중 (아이들링)</option>
              <option>비가 오거나 날씨가 추울 때</option>
              <option>항상 발생</option>
              <option>간헐적 (불규칙하게 발생)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              진단 대상 차량
            </label>
            <div className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium">
              {car.name} ({car.year}년식 · {Number(car.km).toLocaleString()}km)
            </div>
          </div>
        </div>

        {/* Photo Upload & Sample Cases */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-amber-600" />
              관련 사진 첨부 (계기판 경고등, 타이어, 브레이크, 누유 등 선택):
            </label>
            <span className="text-[11px] text-amber-600 font-medium">
              AI가 이미지를 직접 시각 판독합니다
            </span>
          </div>

          {/* Sample test cases buttons */}
          <div className="mb-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-amber-900 shrink-0">
              📸 테스트용 샘플 사진:
            </span>
            {SAMPLE_DIAGNOSIS_CASES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadSample(sample)}
                className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg transition-all font-medium"
              >
                {sample.title}
              </button>
            ))}
          </div>

          {/* Image Upload Area */}
          {!imagePreview ? (
            <label className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-amber-50/30 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-sm font-semibold text-slate-700">
                사진 선택 또는 모바일 카메라 촬영
              </span>
              <span className="text-xs text-slate-400 mt-1">
                계기판 경고등, 타이어 홈, 브레이크 디스크, 하부 누유 흔적 등 (JPG, PNG)
              </span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative border border-slate-200 rounded-2xl p-3 bg-slate-900 text-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={imagePreview}
                  alt="진단 첨부 사진"
                  className="w-20 h-20 object-contain rounded-xl bg-slate-950 border border-slate-800"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    사진 첨부 완료 (Gemini AI Vision 분석 대상)
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-0.5">
                    ✓ 모델 입력 준비 완료
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                title="사진 제거"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleRunDiagnosis}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>1급 정비 기능장 AI가 사진과 증상을 정밀 분석 중입니다...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Gemini 3.8 Flash AI 실시간 정밀 진단 시작</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Diagnosis Result Report */}
      {result && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-lg space-y-6 animate-in fade-in duration-300">
          {/* Severity Header */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
              result.severity === 'EMERGENCY'
                ? 'bg-red-50 border-red-300 text-red-900'
                : result.severity === 'WARNING'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-3">
              {result.severity === 'EMERGENCY' ? (
                <AlertOctagon className="w-8 h-8 text-red-600 shrink-0 animate-pulse" />
              ) : result.severity === 'WARNING' ? (
                <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
              )}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block">
                  AI 종합 안전 판정
                </span>
                <h3 className="text-lg font-black">{result.severityLabel}</h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-semibold block text-slate-500">운행 가능 여부</span>
              <span
                className={`text-xs font-black px-2.5 py-1 rounded-full ${
                  result.canDrive
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {result.canDrive ? '서행 주행 가능 (정비소 이동)' : '운행 중단 · 견인 권장'}
              </span>
            </div>
          </div>

          {/* Comprehensive Summary */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              진단 총평 (종합 분석)
            </h4>
            <p className="text-sm sm:text-base text-slate-800 font-medium mt-1 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {result.summary}
            </p>
          </div>

          {/* Visual Findings if photo attached */}
          {result.visualFindings && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs sm:text-sm text-blue-950 space-y-1">
              <div className="flex items-center gap-2 font-bold text-blue-900">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>AI 이미지 시각 판독 결과 (Vision Findings)</span>
              </div>
              <p className="leading-relaxed text-slate-700">{result.visualFindings}</p>
            </div>
          )}

          {/* Suspected Causes */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              유력 의심 고장 원인 TOP {result.suspectedCauses.length}
            </h4>
            <div className="space-y-3">
              {result.suspectedCauses.map((cause, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm sm:text-base">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-black">
                        {idx + 1}
                      </span>
                      <span>{cause.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-normal">
                        관련 부품: {cause.relatedPart}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-blue-600">
                      확률 {cause.probability}%
                    </span>
                  </div>

                  {/* Probability Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-700"
                      style={{ width: `${cause.probability}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{cause.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Immediate Actions Checklist */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              운전자 즉시 안전 조치 요령
            </h4>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              {result.immediateActions.map((action, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mechanic Visit Guide */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Wrench className="w-4 h-4" />
              <span>정비소 방문 시 가이드 (과잉 정비 방지)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block">정비사에게 요청할 필수 점검 항목:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-200">
                  {result.mechanicGuide.checklist.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-slate-400 font-semibold block">예상 수리비 범위 (부품+공임):</span>
                  <div className="text-lg font-black text-amber-300">
                    {result.mechanicGuide.estimatedCostRange}
                  </div>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 text-[11px] text-slate-300">
                  <strong className="text-white">💡 정비사에게 물어볼 핵심 질문:</strong>{' '}
                  "{result.mechanicGuide.keyQuestionToAsk}"
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() =>
                  onAddLogFromDiagnosis(
                    result.suspectedCauses[0]?.relatedPart || '차량 이상 점검 및 수리',
                    0,
                    `AI 진단 기록: ${result.summary.slice(0, 50)}...`
                  )
                }
                className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors cursor-pointer"
              >
                이 진단 내역으로 정비 이력 등록
              </button>
              <button
                type="button"
                onClick={onNavigateEstimate}
                className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                내 차 정비 견적표 확인하기 ↗
              </button>
            </div>
          </div>

          {/* Follow-up AI Mechanic Consultation (Chat) */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-sm text-slate-900">
                1급 정비 기능장 AI에게 추가 질문하기
              </h4>
            </div>
            <p className="text-xs text-slate-500">
              "내일 고속도로 주행해도 되나요?", "공임나라에 부품 사가면 공임 얼마인가요?" 등 궁금한 점을 편하게 물어보세요.
            </p>

            {chatMessages.length > 0 && (
              <div className="space-y-2.5 max-h-64 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200">
                {chatMessages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-slate-100 text-slate-800 rounded-bl-none'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="p-3 bg-slate-100 rounded-2xl rounded-bl-none text-xs text-slate-500 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>정비사 AI가 답변을 작성 중입니다...</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="추가로 궁금한 점을 질문하세요..."
                className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>질문</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
