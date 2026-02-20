const BABY_PHOTO_PROMPT_VERSION = "baby-photo-ko-v2-2026-02-19";
const BABY_PHOTO_IMAGE_MODEL = "gpt-image-1.5";
const BABY_PHOTO_ANALYSIS_MODEL = "gpt-4.1-mini";
const BABY_PHOTO_ANALYSIS_PROMPT_VERSION = "traits-analysis-v1";
const AI_DEFAULT_MODEL = "gpt-4.1-nano";
const BABY_PHOTO_IMAGE_STYLE_PROMPT =
  "실사 사진 스타일, 병원 신생아 촬영 느낌, 자연스러운 피부결, 과도한 보정 금지.";
const BABY_PHOTO_IMAGE_SCENE_PROMPT =
  "출생 직후의 신생아가 흰색 속싸개 안에 편안히 누워 있는 장면, 얼굴 중심 클로즈업, 배경은 단순하고 중립적.";
const BABY_PHOTO_IMAGE_SAFETY_PROMPT =
  "아기는 반드시 옷/속싸개를 착용한 상태로 표현하고 성적 맥락, 노출 중심 구도, 과도한 신체 강조를 금지.";
const BABY_PHOTO_IMAGE_NEGATIVE_PROMPT =
  "애니메이션 스타일, 만화, 일러스트, 플라스틱 피부, 성인 얼굴 비율, 뷰티 필터, 과장된 조명, 텍스트, 워터마크.";

function promptTagFromVersion(version) {
  return String(version || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export const BABY_PHOTO_DEFAULTS = {
  promptVersion: BABY_PHOTO_PROMPT_VERSION,
  imageModel: BABY_PHOTO_IMAGE_MODEL,
  analysisModel: BABY_PHOTO_ANALYSIS_MODEL,
  analysisPromptVersion: BABY_PHOTO_ANALYSIS_PROMPT_VERSION,
  aiDefaultModel: AI_DEFAULT_MODEL,
  imageStylePrompt: BABY_PHOTO_IMAGE_STYLE_PROMPT,
  imageScenePrompt: BABY_PHOTO_IMAGE_SCENE_PROMPT,
  imageSafetyPrompt: BABY_PHOTO_IMAGE_SAFETY_PROMPT,
  imageNegativePrompt: BABY_PHOTO_IMAGE_NEGATIVE_PROMPT,
  analysisSystemPrompt:
    "You extract newborn facial traits from reference images for a realistic portrait prompt."
};

export function buildBabyPhotoAnalysisInstruction({ gestationalWeeks, genderLabel }) {
  return [
    "Analyze parent photos and ultrasound photos together and infer likely newborn face traits.",
    "Focus on eyes, nose, mouth, and side profile from all references.",
    "Default to a Korean newborn appearance baseline unless parent features clearly indicate another ethnicity.",
    "If either parent has visible non-Korean traits, preserve and reflect those traits naturally.",
    "Return strict JSON only with these keys:",
    "{\"combined_features_english\":\"...\",\"eye_features_english\":\"...\",\"nose_features_english\":\"...\",\"mouth_features_english\":\"...\",\"side_profile_features_english\":\"...\"}.",
    "Use concise phrases, no diagnosis.",
    `Gestational weeks: ${gestationalWeeks}.`,
    `Expected gender: ${genderLabel}.`
  ].join(" ");
}

export function buildBabyPhotoImagePrompt({
  featureSentence,
  combinedFeatures,
  gestationalWeeks,
  genderLabel,
  promptVersion,
  stylePrompt,
  scenePrompt,
  safetyPrompt,
  negativePrompt
}) {
  const promptTag = promptTagFromVersion(promptVersion) || "BABY_PHOTO_PROMPT";
  const resolvedStylePrompt = String(stylePrompt || "").trim() || BABY_PHOTO_IMAGE_STYLE_PROMPT;
  const resolvedScenePrompt = String(scenePrompt || "").trim() || BABY_PHOTO_IMAGE_SCENE_PROMPT;
  const resolvedSafetyPrompt = String(safetyPrompt || "").trim() || BABY_PHOTO_IMAGE_SAFETY_PROMPT;
  const resolvedNegativePrompt =
    String(negativePrompt || "").trim() || BABY_PHOTO_IMAGE_NEGATIVE_PROMPT;
  return [
    "당신은 참고 이미지를 기반으로 미래 아기의 얼굴을 현실적으로 예측해 생성하는 역할을 합니다.",
    "목표: 엄마 사진 1장, 아빠 사진 1장, 아기 초음파 이미지 1~2장을 참고해 태어날 아이의 얼굴을 현실적으로 예측합니다.",
    "반드시 지켜야 할 원칙:",
    "1. 과장되거나 미화되지 않은 현실적인 한국 신생아 기본 얼굴을 기준으로 시작합니다.",
    "2. 부모의 얼굴 특징은 명확하게 보이는 경우에만 반영하고, 한쪽 부모를 과도하게 닮게 하지 마세요.",
    "3. 초음파 이미지는 얼굴 윤곽, 볼 살, 부드러움, 옆선 보정에만 사용합니다.",
    "4. 피부톤은 엄마와 아빠의 평균에 가까운 자연스러운 톤으로 설정하고, 인위적인 미백/과도한 광택/과도하게 밝은 피부를 피하세요. 신생아 특유의 자연스러운 혈색과 옅은 홍조는 허용합니다.",
    "5. AI 느낌이 강한 완벽한 얼굴을 피하고, 눈이 과도하게 크거나 또렷하지 않게 하며, 성인 같은 또렷한 윤곽을 피하고 신생아 비율을 유지합니다.",
    "6. 인형, 일러스트, 광고 모델 느낌이 아니라 실제 태어날 수 있을 법한 신생아처럼 보이게 하세요.",
    `스타일 지시: ${resolvedStylePrompt}`,
    `상황 지시: ${resolvedScenePrompt}`,
    `안전 지시: ${resolvedSafetyPrompt}`,
    "중요 제한사항: 부모 얼굴을 그대로 복사하지 말고, 질병/장애/의학적 상태를 추측하거나 표현하지 마세요. 과도한 미화와 필터 효과를 금지하며, 예쁜 아기보다 우리 아기 같아 보이는 이미지를 목표로 하세요.",
    `참고 특성(부모/초음파): ${featureSentence}. ${combinedFeatures}.`,
    `임신 주차 참고: ${gestationalWeeks}주.`,
    `예상 성별 참고: ${genderLabel}.`,
    `Prompt version tag: ${promptTag}.`,
    `네거티브 프롬프트: ${resolvedNegativePrompt}`,
    "No text, no watermark."
  ].join(" ");
}
