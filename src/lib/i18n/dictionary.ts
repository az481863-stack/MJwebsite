// 全站文案字典(階段一:寫死內容)。
// 規格 A-1:全站顯示單一語言,隨右上角 [EN / 中文] 切換,不並列雙語。
// 後續動態內容(階段三 CMS)會改由後台提供;此處僅放跨語系的「介面與寫死區塊」文案。

export type Lang = "zh" | "en";

export const LANGS: Lang[] = ["zh", "en"];
export const DEFAULT_LANG: Lang = "zh";

// 導覽列項目(A-2)。href 對應 App Router 路由。
export const NAV_ITEMS = [
  { href: "/", key: "home" },
  { href: "/research", key: "research" },
  { href: "/team", key: "team" },
  { href: "/instruments", key: "instruments" },
  { href: "/blog", key: "blog" },
  { href: "/contact", key: "contact" },
] as const;

type NavKey = (typeof NAV_ITEMS)[number]["key"];

export interface Dictionary {
  nav: Record<NavKey, string>;
  auth: { login: string; account: string; admin: string };
  langToggle: { label: string; toZh: string; toEn: string };
  footer: { rights: string; tagline: string };
  comingSoon: { badge: string; title: string; body: string };
  home: {
    heroEyebrow: string;
    heroTitle: string;
    heroSubtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    researchHeading: string;
    researchIntro: string;
    researchAreas: { title: string; desc: string }[];
    philosophyHeading: string;
    philosophyBody: string[];
    dashboardHeading: string;
    dashboardIntro: string;
    dashboardItems: { tag: string; title: string; date: string }[];
  };
  research: {
    heading: string;
    intro: string;
    areas: { title: string; desc: string }[];
    industryHeading: string;
    industryIntro: string;
    industryItems: { title: string; desc: string }[];
    industryCatLabels: Record<"PATENT" | "LICENSABLE" | "COLLABORATION", string>;
    emptyIndustry: string;
    pubHeading: string;
    pubIntro: string;
    pubEmpty: string;
    pubItems: { authors: string; title: string; venue: string; year: string }[];
  };
  team: {
    heading: string;
    intro: string;
    membersHeading: string;
    tierLabels: Record<"POSTDOC" | "PHD" | "MASTER" | "UNDERGRAD", string>;
    emptyMembers: string;
    emptyAlumni: string;
    emptyJobs: string;
    members: { name: string; role: string; topic: string }[];
    alumniHeading: string;
    alumni: { name: string; year: string; destination: string }[];
    jobsHeading: string;
    jobsIntro: string;
    jobs: { title: string; status: "open" | "full"; desc: string }[];
    statusOpen: string;
    statusFull: string;
    templateHeading: string;
    templateIntro: string;
    templateBody: string;
    copyLabel: string;
    copiedLabel: string;
  };
  blog: {
    heading: string;
    intro: string;
    posts: { title: string; excerpt: string; date: string }[];
  };
  contact: {
    heading: string;
    intro: string;
    labName: string;
    address: string;
    email: string;
    phone: string;
    officeHours: string;
    addressLabel: string;
    emailLabel: string;
    phoneLabel: string;
    officeHoursLabel: string;
    formNote: string;
    form: {
      heading: string;
      intro: string;
      name: string;
      email: string;
      category: string;
      categoryPlaceholder: string;
      categories: { industry: string; academic: string; recruit: string };
      message: string;
      submit: string;
      sending: string;
      success: string;
      errRequired: string;
      errEmail: string;
      errCategory: string;
      errRate: string;
      errGeneric: string;
    };
  };
  courses: { heading: string; intro: string; empty: string; handout: string };
  forStudents: { heading: string; intro: string; empty: string };
  chat: {
    title: string;
    open: string;
    close: string;
    placeholder: string;
    send: string;
    greeting: string;
    error: string;
    rateLimited: string;
  };
}

const zh: Dictionary = {
  nav: {
    home: "首頁",
    research: "研究與產學",
    team: "團隊與招募",
    instruments: "儀器介紹",
    blog: "光電小講堂",
    contact: "聯絡教授",
  },
  auth: { login: "登入", account: "會員", admin: "管理" },
  langToggle: { label: "語言", toZh: "中文", toEn: "EN" },
  footer: {
    rights: "光電物理實驗室",
    tagline: "以光為尺,丈量物質的邊界。",
  },
  comingSoon: {
    badge: "即將推出",
    title: "儀器預約管理系統建置中",
    body: "線上預約、QR 簽退與機況回報功能正在開發,預計於後續階段上線。如需借用儀器,請先透過「聯絡教授」與實驗室聯繫。",
  },
  home: {
    heroEyebrow: "光電物理實驗室 · Optoelectronic Physics Lab",
    heroTitle: "以光為尺,丈量物質的邊界",
    heroSubtitle:
      "我們結合凝態物理、光譜學與奈米製程,探索光與物質交互作用的基礎科學,並將其轉化為次世代光電元件。",
    ctaPrimary: "認識研究方向",
    ctaSecondary: "加入我們",
    researchHeading: "研究領域",
    researchIntro: "從基礎物理到元件應用,我們的研究橫跨三個相互支撐的主軸。",
    researchAreas: [
      {
        title: "半導體光譜學",
        desc: "以時間解析與低溫光譜技術,解析半導體中載子的動力學與量子態。",
      },
      {
        title: "奈米光電元件",
        desc: "設計並製作光偵測器、發光元件與量子點結構,推動高效率光電轉換。",
      },
      {
        title: "量子材料",
        desc: "探索二維材料與拓樸材料的新奇光學響應,尋找未來資訊載體。",
      },
    ],
    philosophyHeading: "主持人理念",
    philosophyBody: [
      "我相信好的研究始於對自然現象單純的好奇,而非追逐熱門題目。實驗室鼓勵成員從第一原理出發,親手搭建量測系統,理解每一條數據背後的物理。",
      "我們重視嚴謹,也重視彼此扶持。無論你的目標是學術、產業或創業,這裡都是你打下扎實基礎、培養獨立思考的地方。",
    ],
    dashboardHeading: "動態佈告欄",
    dashboardIntro: "實驗室的最新動態、學術快報與榮譽榜。",
    dashboardItems: [
      { tag: "學術快報", title: "本實驗室論文獲國際期刊接受刊登", date: "2026.05" },
      { tag: "榮譽榜", title: "碩士生獲頒年度傑出研究獎", date: "2026.04" },
      { tag: "實驗室日常", title: "新一代低溫光譜量測系統正式啟用", date: "2026.03" },
    ],
  },
  research: {
    heading: "研究與產學",
    intro:
      "我們的研究以光與物質交互作用為核心,從基礎科學的探問延伸至產業可用的技術。",
    areas: [
      {
        title: "半導體光譜學",
        desc: "運用時間解析螢光、拉曼與低溫光致發光,量測半導體與異質結構中的載子動力學、能帶結構與缺陷態,建立材料品質與元件效能之間的物理連結。",
      },
      {
        title: "奈米光電元件",
        desc: "從製程到量測一條龍:於無塵室製作光偵測器、發光二極體與量子點元件,並以自建光電量測平台驗證其效率與穩定性。",
      },
      {
        title: "量子材料",
        desc: "聚焦二維半導體、過渡金屬硫化物與拓樸材料,探索其在光激發下的激子、谷自由度與非線性光學響應。",
      },
    ],
    industryHeading: "產學與專利",
    industryIntro: "我們將實驗室的核心技術與業界需求對接,促成技術移轉與合作開發。",
    industryCatLabels: {
      PATENT: "已獲證專利",
      LICENSABLE: "可授權技術",
      COLLABORATION: "企業合作/技轉實績",
    },
    emptyIndustry: "尚未新增產學與專利項目。",
    industryItems: [
      {
        title: "已獲證專利",
        desc: "高靈敏度光偵測元件結構與其製造方法等多項發明專利。",
      },
      {
        title: "可授權技術",
        desc: "低溫光譜量測流程、量子點合成與表面鈍化製程,歡迎洽談授權。",
      },
      {
        title: "企業合作",
        desc: "與光電與半導體廠商進行材料檢測、製程優化與人才共育的長期合作。",
      },
    ],
    pubHeading: "代表著作",
    pubIntro: "近期發表選錄(完整清單將於後續上線)。",
    pubEmpty: "尚未新增著作。",
    pubItems: [
      {
        authors: "Wu M.-J., et al.",
        title: "Ultrafast carrier dynamics in two-dimensional semiconductor heterostructures",
        venue: "Physical Review Letters",
        year: "2025",
      },
      {
        authors: "Wu M.-J., et al.",
        title: "High-efficiency quantum-dot photodetectors via interface passivation",
        venue: "Nature Photonics",
        year: "2024",
      },
    ],
  },
  team: {
    heading: "團隊與招募",
    intro: "我們是一群對光與物質充滿好奇的人。歡迎有熱情的你加入。",
    membersHeading: "現役成員",
    tierLabels: {
      POSTDOC: "博後",
      PHD: "博士生",
      MASTER: "碩士生",
      UNDERGRAD: "專題生",
    },
    emptyMembers: "尚未新增成員。",
    emptyAlumni: "尚未新增校友。",
    emptyJobs: "目前沒有開放職缺。",
    members: [
      { name: "吳孟哲 教授", role: "主持人 (PI)", topic: "半導體光譜學、量子材料" },
      { name: "王同學", role: "博士生", topic: "二維材料激子動力學" },
      { name: "李同學", role: "碩士生", topic: "量子點光偵測器製程" },
      { name: "陳同學", role: "專題生", topic: "低溫光譜量測系統" },
    ],
    alumniHeading: "校友去向",
    alumni: [
      { name: "張同學", year: "2024", destination: "台積電 製程整合工程師" },
      { name: "林同學", year: "2023", destination: "中研院 博士後研究員" },
      { name: "黃同學", year: "2022", destination: "海外攻讀博士" },
    ],
    jobsHeading: "招募職缺",
    jobsIntro: "我們長期歡迎對光電物理有熱情的夥伴加入。",
    jobs: [
      { title: "博士後研究員", status: "open", desc: "主導量子材料光譜研究,協助指導研究生。" },
      { title: "博士生", status: "open", desc: "參與半導體光譜學或奈米元件相關題目。" },
      { title: "碩士生", status: "full", desc: "本學年名額已滿,歡迎明年再洽。" },
    ],
    statusOpen: "開放",
    statusFull: "額滿",
    templateHeading: "應徵範本",
    templateIntro:
      "有意加入者,歡迎複製以下範本、填妥後寄至實驗室信箱。清楚的自我介紹能幫助我們更快認識你。",
    templateBody: `主旨:【應徵實驗室】姓名_應徵職位

吳教授您好:

我是 ____(姓名),目前就讀/任職於 ____(學校系所/單位)。
我對貴實驗室在 ____(研究方向)的研究深感興趣,特別是 ____。

我的背景與技能:
- 學歷:
- 研究/專題經驗:
- 相關技能(量測、製程、程式等):

我希望能加入貴實驗室,期望投入的方向是 ____。
附件為我的履歷與成績單,期待有機會與您進一步討論。

敬祝 研安
____ 敬上
聯絡電話:____
Email:____`,
    copyLabel: "複製應徵範本",
    copiedLabel: "已複製!",
  },
  blog: {
    heading: "光電小講堂",
    intro: "用淺白的語言,聊聊光電物理裡有趣的觀念與實驗室的日常。",
    posts: [
      {
        title: "為什麼半導體會發光?",
        excerpt: "從能帶結構出發,三分鐘理解 LED 發光的物理機制。",
        date: "2026.05.10",
      },
      {
        title: "什麼是激子?光與物質的雙人舞",
        excerpt: "當光子遇上電子與電洞,會發生什麼有趣的事?",
        date: "2026.04.22",
      },
      {
        title: "走進無塵室:一顆元件的誕生",
        excerpt: "帶你看看一個光電元件,從晶圓到量測的完整旅程。",
        date: "2026.03.30",
      },
    ],
  },
  contact: {
    heading: "聯絡教授",
    intro: "歡迎就學術交流、產學合作或加入實驗室與我們聯繫。",
    labName: "光電物理實驗室 — 吳孟哲 教授",
    address: "台灣 · 物理學系 光電物理實驗室",
    email: "mjwu.lab@example.edu.tw",
    phone: "+886-2-0000-0000",
    officeHours: "週一至週五 09:00–17:00",
    addressLabel: "地址",
    emailLabel: "電子郵件",
    phoneLabel: "電話",
    officeHoursLabel: "聯絡時間",
    formNote: "亦可直接以上方 email、電話與我們聯繫。",
    form: {
      heading: "線上聯絡表單",
      intro: "請選擇主題並留下您的訊息,我們會儘速回覆。",
      name: "您的姓名",
      email: "您的 Email",
      category: "聯絡主題",
      categoryPlaceholder: "請選擇主題…",
      categories: {
        industry: "產學合作洽詢",
        academic: "學術同行交流",
        recruit: "學生·博士後應徵面談",
      },
      message: "訊息內容",
      submit: "送出",
      sending: "送出中…",
      success: "已送出,感謝您的來信,我們會儘速回覆。",
      errRequired: "請填寫所有必填欄位。",
      errEmail: "請輸入有效的 Email。",
      errCategory: "請選擇聯絡主題。",
      errRate: "送出過於頻繁,請稍後再試。",
      errGeneric: "送出失敗,請稍後再試,或直接以 email 與我們聯繫。",
    },
  },
  courses: {
    heading: "課程紀錄",
    intro: "實驗室相關課程的大綱與講義。",
    empty: "尚未新增課程。",
    handout: "下載講義",
  },
  forStudents: {
    heading: "給高中生的話",
    intro: "寫給對光電物理好奇的你。",
    empty: "內容準備中。",
  },
  chat: {
    title: "實驗室小幫手",
    open: "開啟聊天",
    close: "關閉",
    placeholder: "詢問關於研究、應徵、儀器預約…",
    send: "送出",
    greeting: "你好!我是實驗室客服小幫手,可以回答研究方向、如何應徵、儀器預約規則、聯絡方式等問題。",
    error: "抱歉,暫時無法回應,請稍後再試。",
    rateLimited: "詢問太頻繁了,請稍後再試。",
  },
};

const en: Dictionary = {
  nav: {
    home: "Home",
    research: "Research & Industry",
    team: "Lab Team",
    instruments: "Instruments",
    blog: "Blog",
    contact: "Contact",
  },
  auth: { login: "Sign in", account: "Account", admin: "Admin" },
  langToggle: { label: "Language", toZh: "中文", toEn: "EN" },
  footer: {
    rights: "Optoelectronic Physics Lab",
    tagline: "Measuring the boundaries of matter with light.",
  },
  comingSoon: {
    badge: "Coming Soon",
    title: "Instrument Booking System Under Construction",
    body: "Online booking, QR check-out and equipment status reporting are in development and will launch in a later phase. To borrow an instrument, please reach out via the Contact page.",
  },
  home: {
    heroEyebrow: "Optoelectronic Physics Lab",
    heroTitle: "Measuring the boundaries of matter with light",
    heroSubtitle:
      "We combine condensed-matter physics, spectroscopy and nanofabrication to explore the fundamental science of light–matter interaction and turn it into next-generation optoelectronic devices.",
    ctaPrimary: "Explore our research",
    ctaSecondary: "Join us",
    researchHeading: "Research Areas",
    researchIntro:
      "From fundamental physics to device applications, our work spans three mutually reinforcing pillars.",
    researchAreas: [
      {
        title: "Semiconductor Spectroscopy",
        desc: "Resolving carrier dynamics and quantum states in semiconductors with time-resolved and low-temperature spectroscopy.",
      },
      {
        title: "Nanoscale Optoelectronics",
        desc: "Designing and fabricating photodetectors, light emitters and quantum-dot structures for efficient light–electricity conversion.",
      },
      {
        title: "Quantum Materials",
        desc: "Exploring the novel optical responses of 2D and topological materials as carriers of future information.",
      },
    ],
    philosophyHeading: "PI's Philosophy",
    philosophyBody: [
      "I believe good research begins with genuine curiosity about nature, not with chasing trendy topics. Our lab encourages members to reason from first principles, build their own measurement systems, and understand the physics behind every data point.",
      "We value rigor and mutual support in equal measure. Whether your goal is academia, industry or entrepreneurship, this is a place to build solid foundations and cultivate independent thinking.",
    ],
    dashboardHeading: "Lab Dashboard",
    dashboardIntro: "Latest news, research highlights and honors from the lab.",
    dashboardItems: [
      { tag: "Research", title: "Our paper accepted by an international journal", date: "2026.05" },
      { tag: "Honors", title: "Master's student receives annual research award", date: "2026.04" },
      { tag: "Lab Life", title: "New low-temperature spectroscopy system goes live", date: "2026.03" },
    ],
  },
  research: {
    heading: "Research & Industry",
    intro:
      "Our research centers on light–matter interaction, reaching from fundamental questions to industry-ready technology.",
    areas: [
      {
        title: "Semiconductor Spectroscopy",
        desc: "Using time-resolved fluorescence, Raman and low-temperature photoluminescence to probe carrier dynamics, band structure and defect states in semiconductors and heterostructures, linking material quality to device performance.",
      },
      {
        title: "Nanoscale Optoelectronics",
        desc: "End to end, from process to measurement: we fabricate photodetectors, LEDs and quantum-dot devices in the cleanroom and validate their efficiency and stability on home-built optoelectronic platforms.",
      },
      {
        title: "Quantum Materials",
        desc: "Focusing on 2D semiconductors, transition-metal dichalcogenides and topological materials, we study excitons, valley degrees of freedom and nonlinear optical responses under optical excitation.",
      },
    ],
    industryHeading: "Industry & Patents",
    industryIntro:
      "We connect our core technologies with industry needs, enabling technology transfer and joint development.",
    industryCatLabels: {
      PATENT: "Granted Patents",
      LICENSABLE: "Licensable Technology",
      COLLABORATION: "Industry Collaboration",
    },
    emptyIndustry: "No industry or patent items yet.",
    industryItems: [
      {
        title: "Granted Patents",
        desc: "Several invention patents covering high-sensitivity photodetector structures and their fabrication methods.",
      },
      {
        title: "Licensable Technology",
        desc: "Low-temperature spectroscopy workflows, quantum-dot synthesis and surface passivation processes available for licensing.",
      },
      {
        title: "Industry Collaboration",
        desc: "Long-term partnerships with optoelectronic and semiconductor companies in material testing, process optimization and talent development.",
      },
    ],
    pubHeading: "Selected Publications",
    pubIntro: "A selection of recent work (full list coming later).",
    pubEmpty: "No publications yet.",
    pubItems: [
      {
        authors: "Wu M.-J., et al.",
        title: "Ultrafast carrier dynamics in two-dimensional semiconductor heterostructures",
        venue: "Physical Review Letters",
        year: "2025",
      },
      {
        authors: "Wu M.-J., et al.",
        title: "High-efficiency quantum-dot photodetectors via interface passivation",
        venue: "Nature Photonics",
        year: "2024",
      },
    ],
  },
  team: {
    heading: "Lab Team",
    intro: "We are a group of people curious about light and matter. Passionate newcomers are always welcome.",
    membersHeading: "Current Members",
    tierLabels: {
      POSTDOC: "Postdoc",
      PHD: "PhD Student",
      MASTER: "Master's Student",
      UNDERGRAD: "Undergraduate",
    },
    emptyMembers: "No members added yet.",
    emptyAlumni: "No alumni added yet.",
    emptyJobs: "No open positions at the moment.",
    members: [
      { name: "Prof. Meng-Jer Wu", role: "Principal Investigator", topic: "Semiconductor spectroscopy, quantum materials" },
      { name: "Wang", role: "PhD Student", topic: "Exciton dynamics in 2D materials" },
      { name: "Lee", role: "Master's Student", topic: "Quantum-dot photodetector fabrication" },
      { name: "Chen", role: "Undergraduate", topic: "Low-temperature spectroscopy system" },
    ],
    alumniHeading: "Alumni",
    alumni: [
      { name: "Chang", year: "2024", destination: "TSMC, Process Integration Engineer" },
      { name: "Lin", year: "2023", destination: "Academia Sinica, Postdoctoral Researcher" },
      { name: "Huang", year: "2022", destination: "PhD studies abroad" },
    ],
    jobsHeading: "Open Positions",
    jobsIntro: "We continually welcome partners passionate about optoelectronic physics.",
    jobs: [
      { title: "Postdoctoral Researcher", status: "open", desc: "Lead quantum-materials spectroscopy research and help mentor graduate students." },
      { title: "PhD Student", status: "open", desc: "Work on semiconductor spectroscopy or nanoscale device topics." },
      { title: "Master's Student", status: "full", desc: "Positions for this year are filled; inquiries welcome next year." },
    ],
    statusOpen: "Open",
    statusFull: "Full",
    templateHeading: "Application Template",
    templateIntro:
      "If you'd like to join, copy the template below, fill it in and email it to the lab. A clear introduction helps us get to know you faster.",
    templateBody: `Subject: [Lab Application] Name_Position

Dear Prof. Wu,

My name is ____ (name), currently studying/working at ____ (school/department/organization).
I am deeply interested in your lab's research on ____ (direction), especially ____.

My background and skills:
- Education:
- Research/project experience:
- Relevant skills (measurement, fabrication, programming, etc.):

I would love to join your lab and would like to focus on ____.
Attached are my CV and transcript. I look forward to the chance to discuss further.

Best regards,
____
Phone: ____
Email: ____`,
    copyLabel: "Copy template",
    copiedLabel: "Copied!",
  },
  blog: {
    heading: "Blog",
    intro: "Plain-language stories about fun ideas in optoelectronic physics and life in the lab.",
    posts: [
      {
        title: "Why do semiconductors emit light?",
        excerpt: "Starting from band structure, understand how an LED glows in three minutes.",
        date: "2026.05.10",
      },
      {
        title: "What is an exciton? A duet of light and matter",
        excerpt: "What happens when a photon meets an electron and a hole?",
        date: "2026.04.22",
      },
      {
        title: "Inside the cleanroom: the birth of a device",
        excerpt: "Follow an optoelectronic device on its journey from wafer to measurement.",
        date: "2026.03.30",
      },
    ],
  },
  contact: {
    heading: "Contact",
    intro: "Reach out for academic exchange, industry collaboration, or to join the lab.",
    labName: "Optoelectronic Physics Lab — Prof. Meng-Jer Wu",
    address: "Department of Physics, Optoelectronic Physics Lab, Taiwan",
    email: "mjwu.lab@example.edu.tw",
    phone: "+886-2-0000-0000",
    officeHours: "Mon–Fri 09:00–17:00",
    addressLabel: "Address",
    emailLabel: "Email",
    phoneLabel: "Phone",
    officeHoursLabel: "Hours",
    formNote: "You may also reach us directly via the email or phone above.",
    form: {
      heading: "Contact form",
      intro: "Pick a topic and leave your message; we'll get back to you soon.",
      name: "Your name",
      email: "Your email",
      category: "Topic",
      categoryPlaceholder: "Select a topic…",
      categories: {
        industry: "Industry collaboration",
        academic: "Academic exchange",
        recruit: "Student / postdoc application",
      },
      message: "Message",
      submit: "Send",
      sending: "Sending…",
      success: "Sent — thank you for reaching out. We'll reply soon.",
      errRequired: "Please fill in all required fields.",
      errEmail: "Please enter a valid email.",
      errCategory: "Please select a topic.",
      errRate: "Too many submissions, please try again later.",
      errGeneric: "Could not send. Please try again later or email us directly.",
    },
  },
  courses: {
    heading: "Courses",
    intro: "Syllabi and handouts for lab-related courses.",
    empty: "No courses added yet.",
    handout: "Download handout",
  },
  forStudents: {
    heading: "For High-School Students",
    intro: "A note for those curious about optoelectronic physics.",
    empty: "Content coming soon.",
  },
  chat: {
    title: "Lab Assistant",
    open: "Open chat",
    close: "Close",
    placeholder: "Ask about research, applying, instrument booking…",
    send: "Send",
    greeting: "Hi! I'm the lab's assistant. I can answer questions about our research, how to apply, instrument booking rules, contact info, and more.",
    error: "Sorry, I can't respond right now. Please try again later.",
    rateLimited: "Too many messages — please try again later.",
  },
};

export const dictionaries: Record<Lang, Dictionary> = { zh, en };
