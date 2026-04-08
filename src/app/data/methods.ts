import { FileText, Image, Video, Code, BookOpen, Mic, PenTool, Sparkles, Users, LucideIcon } from 'lucide-react';

export interface Method {
  id: string;
  title: string;
  author: string;
  tag: string;
  icon: LucideIcon;
  tagColor: string;
  description: string;
  steps: {
    title: string;
    content: string;
    images?: string[];
    video?: string;
  }[];
  tips: string[];
  tools: string[];
  references?: { title: string; url: string }[];
  image?: string;
  video?: string;
  attachments?: { name: string; url: string }[];
  password?: string;
}

export const methods: Method[] = [
  {
    id: 'ai-article-writing',
    title: 'AI로 기사 작성하는 Tip',
    author: '김민지',
    tag: '문서작성',
    icon: FileText,
    tagColor: 'bg-blue-100 text-blue-700',
    description: 'ChatGPT와 Claude를 활용하여 고품질 기사를 빠르게 작성하는 실전 노하우를 공유합니다. 기획부터 퇴고까지 모든 단계를 AI로 효율화하세요.',
    steps: [
      {
        title: '1단계: 주제 리서치 및 아웃라인 작성',
        content: 'ChatGPT에게 "이 주제에 대한 최신 트렌드와 핵심 논점을 정리해줘"라고 요청하여 배경 조사를 시작합니다. 그 다음 아웃라인을 생성하고 각 섹션별 핵심 메시지를 정리합니다.',
      },
      {
        title: '2단계: 섹션별 초안 작성',
        content: '각 섹션을 개별적으로 작성 요청합니다. "전문적이고 객관적인 톤으로", "사례 중심으로" 등 구체적인 스타일 가이드를 제시하면 더 좋은 결과를 얻을 수 있습니다.',
      },
      {
        title: '3단계: 팩트 체크 및 검증',
        content: 'AI가 생성한 내용의 정확성을 반드시 확인합니다. 통계, 인용, 날짜 등은 직접 검증하고 필요시 수정합니다.',
      },
      {
        title: '4단계: 톤앤매너 조정 및 퇴고',
        content: '초안을 Claude에 입력하고 "독자층은 30-40대 직장인, 더 친근하게 수정해줘" 같은 식으로 톤을 조정합니다. 여러 번 반복하여 완성도를 높입니다.',
      },
    ],
    tips: [
      '프롬프트에 대상 독자, 톤, 분량을 명확히 지정하세요',
      '한 번에 전체 기사를 작성하기보다 섹션별로 나눠서 작성하면 품질이 높아집니다',
      'AI 결과물을 그대로 쓰지 말고 반드시 사람의 관점으로 퇴고하세요',
    ],
    tools: ['ChatGPT', 'Claude', 'Grammarly'],
  },
  {
    id: 'audiobook-creation',
    title: '오디오북 만들기 가이드',
    author: '이준호',
    tag: '멀티미디어',
    icon: Mic,
    tagColor: 'bg-purple-100 text-purple-700',
    description: 'ElevenLabs와 AI 보이스 기술을 활용하여 전문가 수준의 오디오���을 제작하는 방법을 안내합니다.',
    steps: [
      {
        title: '1계: 스크립트 준비 및 분할',
        content: '텍스트 파일을 챕터 또는 장면별로 분할합니다. 각 파일은 3-5분 분량이 적당하며, 자연스러운 호흡을 위해 문단 단위로 나눕니다.',
      },
      {
        title: '2단계: AI 보이스 선택 및 테스트',
        content: 'ElevenLabs에서 콘텐츠 톤에 맞는 음성을 선택합니다. 샘플 텍스트로 여러 음성을 테스트해보고 최적의 음색과 속도를 찾습니다.',
      },
      {
        title: '3단계: 배치 생성 및 다운로드',
        content: '준비한 스크립트를 업로드하고 일괄 변환을 실행합니다. 각 파일의 품질을 확인하고 필요시 재생성합니다.',
      },
      {
        title: '4단계: 후반 작업 및 편집',
        content: 'Audacity나 Adobe Audition으로 파일을 편집합니다. 배경음악 추가, 노이즈 제거, 볼륨 조정 등을 통해 완성도를 높입니다.',
      },
    ],
    tips: [
      '자연스러운 억양을 위해 문장 부호를 적극 활용하세요',
      '긴 문장은 쉼표로 나눠 호흡을 조절할 수 있습니다',
      '배경음악은 -20dB 정도로 낮춰 음성이 묻히지 않게 하세요',
    ],
    tools: ['ElevenLabs', 'Audacity', 'Adobe Audition'],
  },
  {
    id: 'mockup-image-generation',
    title: '고퀄리티 목업 이미지 생성법',
    author: '박서연',
    tag: '디자인',
    icon: Image,
    tagColor: 'bg-pink-100 text-pink-700',
    description: 'Midjourney와 DALL-E를 활용하여 프로페셔널한 제품 목업과 프레젠테이션용 이미지를 생성하는 방법을 알려드립니다.',
    steps: [
      {
        title: '1단계: 컨셉 및 스타일 정의',
        content: '어떤 제품을 어떤 분위기로 표현할지 구체화합니다. 레퍼런스 이미지를 수집하고 키워드를 정리합니다.',
      },
      {
        title: '2단계: 프롬프트 작성',
        content: 'Midjourney에 "professional product mockup, minimalist style, soft lighting, white background, --ar 16:9 --q 2" 같은 구체적인 프롬프트를 입력합니다.',
      },
      {
        title: '3단계: 이미지 생성 및 선택',
        content: '여러 버전을 생성하고 최적의 결과물을 선택합니다. Upscale 기능으로 해상도를 높입니다.',
      },
      {
        title: '4단계: Photoshop으로 마무리',
        content: 'Generative Fill로 배경 확장, 불필요한 요소 제거, 색보정 등을 진행합니다. 실제 제품 이미지를 합성할 수도 있습니다.',
      },
    ],
    tips: [
      '조명 키워드: soft lighting, studio lighting, golden hour 등을 활용하세요',
      '--ar 16:9, --ar 1:1 등 비율 파라미터로 용도에 맞게 조정하세요',
      'V 버튼으로 Variation을 만들어 다양한 옵션을 확보하세요',
    ],
    tools: ['Midjourney', 'DALL-E 3', 'Adobe Photoshop'],
  },
  {
    id: 'chatgpt-productivity',
    title: 'ChatGPT로 업무 효율 3배 올리기',
    author: '최도윤',
    tag: '문서작성',
    icon: Sparkles,
    tagColor: 'bg-blue-100 text-blue-700',
    description: '일상 업무에서 ChatGPT를 전략적으로 활용하여 생산성을 극대화하는 10가지 실전 팁을 소개합니다.',
    steps: [
      {
        title: '1단계: 커스텀 인스트럭션 설정',
        content: '자주 하는 업무 유형, 선호하는 답변 스타일, 산업 배경 등을 커스텀 인스트럭션에 설정하여 매번 반복 설명하는 시간을 절약합니다.',
      },
      {
        title: '2단계: 템플릿 프롬프트 라이브러리 구축',
        content: '회의록 작성, 이메일 답변, 보고서 요약 등 자주 사용하는 프롬프트를 문서화하여 저장합니다. 필요할 때 복사해서 변수만 수정하면 됩니다.',
      },
      {
        title: '3단계: 멀티턴 대화로 정교화',
        content: '첫 답변에 만족하지 말고 "더 구체적으로", "예시를 추가해줘", "비즈니스 ��으로 바꿔줘" 등으로 계속 다듬어갑니다.',
      },
      {
        title: '4단계: 파일 업로드 기능 활용',
        content: 'PDF, 엑셀, 이미지 등을 직접 업로드하여 분석, 요약, 데이터 추출 등을 요청합니다. 긴 문서도 핵심만 빠르게 파악할 수 있습니다.',
      },
    ],
    tips: [
      '롤플레이 요청: "당신은 경험 10년의 마케팅 디렉터입니다"로 전문성 높이기',
      '단계별 사고 유도: "단계별로 생각해줘"를 추가하면 논리적 답변을 얻을 수 있습니다',
      '제약 조건 명시: 글자 수, 톤앤매너, 포함/제외 요소 등을 명확히 지정하세요',
    ],
    tools: ['ChatGPT Plus', 'Notion (템플릿 저장용)'],
  },
  {
    id: 'presentation-speed',
    title: '프레젠테이션 자료 10분 만에 완성하기',
    author: '정수민',
    tag: '디자인',
    icon: PenTool,
    tagColor: 'bg-pink-100 text-pink-700',
    description: 'Gamma, Tome, Beautiful.ai 같은 AI ���레젠테이션 도구로 빠르게 전문적인 슬라이드를 만드는 방법을 안내합니다.',
    steps: [
      {
        title: '1단계: 개요 작성',
        content: 'ChatGPT에게 "○○ 주제로 10페이지 분량의 프레젠테이션 개요를 작성해줘. 도입-본론-결론 구조로"라고 요청합니다.',
      },
      {
        title: '2단계: Gamma로 슬라이드 생성',
        content: 'Gamma.app에 개요를 붙여넣고 테마를 선택합니다. AI가 자동으로 레이아웃, 이미지, 아이콘을 배치해줍니다.',
      },
      {
        title: '3단계: 내용 및 디자인 조정',
        content: '각 슬라이드의 텍스트를 검토하고 수정합니다. 이미지를 교체하거나 차트를 추가하여 완성도를 높입니다.',
      },
      {
        title: '4단계: 발표 노트 작성',
        content: 'ChatGPT에게 각 슬라이드의 스크립트를 요청합니다. "1분 분량, 전문적이고 간결한 톤으로"와 같이 지정합니다.',
      },
    ],
    tips: [
      'Gamma는 무료 크레딧으로 시작 가능하니 부담 없이 테스트해보세요',
      '슬라이드 개수는 발표 시간의 2배로 잡고 줄여나가는 것이 효율적입니다',
      '복잡한 데이터는 Gamma보다 직접 차트를 만들어 업로드하는 게 나을 수 있습니다',
    ],
    tools: ['Gamma', 'Tome', 'ChatGPT'],
  },
  {
    id: 'video-editing-automation',
    title: '비디오 편집 자동화 방법',
    author: '강태현',
    tag: '멀티미디어',
    icon: Video,
    tagColor: 'bg-purple-100 text-purple-700',
    description: 'Descript와 Runway ML을 활용한 자막 생성, 편집, 효과 추가 자동화 워크플로우를 소개합니다.',
    steps: [
      {
        title: '1단계: 영상 업로드 및 자동 전사',
        content: 'Descript에 영상 파일을 업로드하면 자동으로 음성을 텍스트로 변환합니다. 한국어도 높은 정확도로 인식됩니다.',
      },
      {
        title: '2단계: 텍스트 기반 편집',
        content: '전사된 텍스트를 문서 편집하듯이 수정하면 영상도 자동으로 편집됩니다. 불필요한 부분 삭제, 순서 변경이 간편합니다.',
      },
      {
        title: '3단계: 자막 스타일링 및 추가',
        content: '자동 생성된 자막의 폰트, 색상, 위치를 조정합니다. 템플릿을 저장하여 다음에도 같은 스타일을 빠르게 적용할 수 있습니다.',
      },
      {
        title: '4단계: AI 효과 및 배경 제거',
        content: 'Studio Sound로 노이즈를 제거하고 음질을 향상시킵니다. 필요시 배경 제거나 AI 아바타 기능도 활용합니다.',
      },
    ],
    tips: [
      '영상이 길면 챕터로 나눠 작업하면 관리가 편합니다',
      'Filler word 제거 기능으로 "음", "어" 같은 군더더기를 한 번에 삭제하세요',
      '자막은 2줄 이하로 유지하고 화면에 3초 이상 노출되도록 하세요',
    ],
    tools: ['Descript', 'Runway ML', 'CapCut'],
  },
  {
    id: 'code-review-automation',
    title: '코드 리뷰 자동화 가이드',
    author: '송지우',
    tag: '개발',
    icon: Code,
    tagColor: 'bg-green-100 text-green-700',
    description: 'GitHub Copilot과 AI 코드 리뷰 도구를 활용하여 코드 품질을 높이고 리뷰 시간을 단축하는 방법을 설명합니다.',
    steps: [
      {
        title: '1단계: GitHub Actions 설정',
        content: 'PR이 생성될 때 자동으로 AI 리뷰가 실행되도록 workflow를 설정합니다. CodeRabbit이나 PR-Agent를 연동합니다.',
      },
      {
        title: '2단계: 리뷰 규칙 커스터마이징',
        content: '팀의 코딩 컨벤션, 보안 체크리스트, 성능 가이드라인 등을 설정 파일에 명시합니다.',
      },
      {
        title: '3단계: AI 리뷰 결과 확인 및 반영',
        content: 'PR에 자동으로 달리는 코멘트를 검토하고 개선이 필요한 부분을 수정합니다. 오탐도 있으니 비판적으로 판단하세요.',
      },
      {
        title: '4단계: 사람 리뷰와 병행',
        content: 'AI가 놓친 비즈니스 로직이나 아키텍처 결정은 사람이 리뷰합니다. AI는 보조 도구로 활용하세요.',
      },
    ],
    tips: [
      'AI 리뷰는 코드 스타일, 잠재적 버그, 보안 이슈에 강점이 있습니다',
      '복잡한 비즈니스 로직은 사람이 직접 리뷰하는 것이 정확합니다',
      '팀원들에게 AI 리뷰 결과를 맹신하지 말라고 교육하세요',
    ],
    tools: ['CodeRabbit', 'GitHub Copilot', 'SonarQube'],
  },
  {
    id: 'customer-script',
    title: 'AI를 활용한 고객 응대 스크립트 작성법',
    author: '윤서현',
    tag: '문서작성',
    icon: Users,
    tagColor: 'bg-blue-100 text-blue-700',
    description: '다양한 고객 상황에 대응하는 전문적인 응대 스크립트를 ChatGPT로 빠르게 생성하는 노하우를 공유합니다.',
    steps: [
      {
        title: '1단계: 상황 시나리오 정의',
        content: '고객 문의 유형을 분류합니다. 불만 처리, 제품 문의, 환불 요청, 기술 지원 등 카테고리별로 정리합니다.',
      },
      {
        title: '2단계: 톤앤매너 가이드 작성',
        content: '브랜드 목소리, 존댓말 수준, 금지 표현 등을 문서화합니다. 이를 프롬프트에 포함시킵니���.',
      },
      {
        title: '3단계: ChatGPT로 스크립트 생성',
        content: '"고객이 배송 지연에 불만을 제기했을 때, 공감하고 해결책을 제시하는 200자 이내의 응대 스크립트를 작성해줘"처럼 구체적으로 요청합니다.',
      },
      {
        title: '4단계: 실전 테스트 및 개선',
        content: '생성된 스크립트를 실제 상황에 적용해보고 피드백을 수집합니다. 효과적인 표현은 템플릿화합니다.',
      },
    ],
    tips: [
      '여러 버전을 생성하여 상황에 맞게 선택할 수 있도록 하세요',
      '공감 표현, 사과 표현, 해결 제안의 3단계 구조를 유지하세요',
      '법적 리스크가 있는 표현은 법무팀 검토를 받으세요',
    ],
    tools: ['ChatGPT', 'Claude', 'Notion (스크립트 관리)'],
  },
  {
    id: 'study-material-summary',
    title: '학습 자료 요약 및 정리 노하우',
    author: '임하은',
    tag: '문서작성',
    icon: BookOpen,
    tagColor: 'bg-blue-100 text-blue-700',
    description: 'Claude와 ChatGPT를 활용하여 긴 문서, 논문, 책을 효율적으로 요약하고 핵심을 추출하는 방법을 안내합니다.',
    steps: [
      {
        title: '1단계: 문서 업로드 및 1차 요약',
        content: 'Claude에 PDF나 긴 텍스트를 업로드하고 "핵심 내용을 10개 불릿포인트로 요약해줘"라고 요청합니다.',
      },
      {
        title: '2단계: 섹션별 심화 분석',
        content: '관심 있는 부분을 지정하여 "이 섹션을 더 자세히 설명해줘", "여기에 나온 개념을 예시와 함께 설명해줘" 등으로 깊이 파고듭니다.',
      },
      {
        title: '3단계: 구조화 및 마인드맵 생성',
        content: '요약 내용을 계층 구조로 정리합니다. "이 내용을 대주제-중주제-소주제 형식으로 재구성해줘"라고 요청합니다.',
      },
      {
        title: '4단계: 퀴즈 및 복습 자료 생성',
        content: '"이 내용을 바탕으로 객관식 10문제를 만들어줘" 또는 "플래시카드 형식으로 만들어줘"로 학습 자료를 생성합니다.',
      },
    ],
    tips: [
      'Claude는 긴 문서 처리에 강점이 있으니 10페이지 이상은 Claude를 추천합니다',
      '요약만 받지 말고 "왜 중요한지", "어떻게 활용할 수 있는지"도 물어보세요',
      '여러 자료를 통합 요약할 때는 주제별로 비교 분석을 요청하면 좋습니다',
    ],
    tools: ['Claude', 'ChatGPT', 'Notion AI'],
  },
  {
    id: 'interview-transcription',
    title: '인터뷰 녹음 자동 텍스트 변환',
    author: '한지민',
    tag: '멀티���디어',
    icon: Mic,
    tagColor: 'bg-purple-100 text-purple-700',
    description: 'Whisper AI와 전사 도구를 활용하여 인터뷰 녹음을 빠르고 정확하게 텍스트로 변환하는 방법을 소개합니다.',
    steps: [
      {
        title: '1단계: 고품질 녹음 확보',
        content: '가능한 한 조용한 환경에서 녹음하고, 마이크를 화자에게 가까이 배치합니다. 배경 소음이 적을수록 전사 정확도가 높아집니다.',
      },
      {
        title: '2단계: Whisper 또는 Clova Note로 전사',
        content: '음성 파일을 업로드하고 언어를 한국어로 설정합니다. 자동으로 화자를 구분해주는 기능도 활용하세요.',
      },
      {
        title: '3단계: 텍스트 교정 및 화자 표시',
        content: '오탈자와 동음이의어 오류를 수정합니다. 화자 구분이 잘못된 부분도 체크합니다.',
      },
      {
        title: '4단계: ChatGPT로 요약 및 하이라이트 추출',
        content: '전사본을 ChatGPT에 입력하고 "핵심 인사이트 5개를 추출해줘", "주요 질문과 답변을 정리해줘" 등을 요청합니다.',
      },
    ],
    tips: [
      '1시간 인터뷰는 보통 5분 내로 전사가 완료됩니다',
      '전문 용어나 고유명사는 커스텀 단어장에 등록하면 정확도가 올라���니다',
      '타임스탬프 기능을 켜면 나중에 원본 오디오를 찾기 쉽습니다',
    ],
    tools: ['Clova Note', 'OpenAI Whisper', 'Otter.ai'],
  },
  {
    id: 'logo-design-ideas',
    title: '브랜드 로고 디자인 아이디어 생성',
    author: '조현우',
    tag: '디자인',
    icon: PenTool,
    tagColor: 'bg-pink-100 text-pink-700',
    description: 'AI 이미지 생성 도구로 다양한 로고 컨셉을 빠르게 만들고 벡터화하는 과정을 설명합니다.',
    steps: [
      {
        title: '1단계: 브랜드 키워드 정리',
        content: '브랜드의 가치, 타겟, 산업, 선호 색상 등을 정리합니다. 경쟁사 로고를 분석하여 차별화 포인트를 찾습니다.',
      },
      {
        title: '2단계: Midjourney로 컨셉 생성',
        content: '"minimalist logo design for eco-friendly brand, leaf symbol, green and white, vector style, --no text" 같은 프롬프트로 여러 버전을 생성합니다.',
      },
      {
        title: '3단계: 마음에 드는 컨셉 선택 및 정교화',
        content: 'Vary 기능으로 선택한 디자인의 변형을 만듭니다. 색상, 형태, 복잡도 등을 조정하며 최적안을 찾습니다.',
      },
      {
        title: '4단계: 벡터화 및 최종 다듬기',
        content: 'Adobe Illustrator의 Image Trace로 벡터 변환���거나, Vectorizer.ai 같은 온라인 도구를 사용합니다. 테일을 수정하여 완성합니다.',
      },
    ],
    tips: [
      '프롬프트에 "vector style", "flat design", "simple"을 추가하면 로고에 적합한 결과가 나옵니다',
      '--no text 파라미터로 불필요한 텍스트 생성을 방지하세요',
      '여러 색상 버전을 만들어 상황별로 활용하세요 (컬러/흑백/단색)',
    ],
    tools: ['Midjourney', 'Adobe Illustrator', 'Vectorizer.ai'],
  },
  {
    id: 'api-documentation',
    title: 'API 문서 자동 생성 가이드',
    author: '배준서',
    tag: '개발',
    icon: Code,
    tagColor: 'bg-green-100 text-green-700',
    description: 'GitHub Copilot과 문서 생성 도구를 활용하여 개발자 친화적인 API 문서를 자동으로 만드는 방법을 안내합니다.',
    steps: [
      {
        title: '1단계: 코드에 주석 및 타입 정의',
        content: 'TypeScript나 JSDoc 형식으로 함수, 파라미터, 리턴값을 명확히 정의합니다. Copilot이 이를 기반으로 문서를 생성합니다.',
      },
      {
        title: '2단계: Swagger/OpenAPI 스펙 자동 생성',
        content: 'NestJS, FastAPI 등 프레임워크의 데코레이터나 플러그인을 활용하여 코드로부터 자동으로 API 스펙을 추출합니다.',
      },
      {
        title: '3단계: Readme 및 가이드 문서 생성',
        content: 'ChatGPT에 API 스펙을 입력하고 "이 API의 사용 가이드를 작성해줘. 예제 코드를 포함해줘"라고 요청합니다.',
      },
      {
        title: '4단계: 인터랙티브 문서 배포',
        content: 'Swagger UI, Redoc, Stoplight 등으로 인터랙티브한 문서를 호스팅합니다. 사용자가 직접 테스트할 수 있도록 합니다.',
      },
    ],
    tips: [
      '코드 변경 시 문서도 자동 업데이트되도록 CI/CD에 통합하세요',
      '예제 코드는 여러 언어 버전(JavaScript, Python, cURL 등)으로 제공하면 좋습니다',
      '에러 응답 예시도 빠짐없이 문서화하세요',
    ],
    tools: ['Swagger', 'GitHub Copilot', 'Postman'],
  },
];