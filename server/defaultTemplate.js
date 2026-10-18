// 新建简历的默认填充内容：蓝色大肥鱼趣味示例简历
// 说明：模块 visible=false 表示该模块在模板中没有内容，默认不在预览中展示，
//       用户可在编辑区点击模块名称上的圆点开关随时启用。
const DEFAULT_AVATAR = require("./defaultAvatar");

const TEMPLATE_VERSION = 3;

function buildDefaultTemplate() {
  const now = Date.now();
  const id = (i) => now + i;
  const textModule = (moduleName, moduleValue, index, visible, content) => ({
    moduleName,
    moduleValue,
    visible,
    index,
    content: content || "",
    data: [],
  });
  return {
    resumeId: "",
    setData: {
      skin: "#333333",
      tplId: 1045,
      // 简历模板：classic 经典单栏 / sidebar 左侧深色栏
      tplKey: "classic",
      coverId: null,
      coverShow: 0,
      mm: 21,
      pp: 30,
      // 间距细分：标题与横线 / 横线与内容 / 子模块之间
      titleGap: 6,
      lineGap: 10,
      itemGap: 10,
      font: 1,
      // 标题字号 / 内容字号（字体·语言设置）
      titleFontSize: 16,
      fontSize: 13,
      lineHeight: 1.7,
      title: "蓝色大肥鱼",
      slogan: "不吃饭，只耗电，随叫随到",
      visitType: 1,
      visitPass: "",
      language: "cn",
      zpType: 0,
      // 有内容的模块排前面，空模块（默认隐藏）排后面
      moduleSort:
        "yixiang,jiaoyu,work,project,jineng,pingjia,zhengshu,shixi,xiaoyuan,baokao,aihao,make",
      hasTitle: false,
    },
    coverData: { name: "", job: "", school: "", mobile: "", email: "" },
    zijianData: { visible: 0, content: "" },
    basicInfo: {
      mobile: "在对话框里戳我一下",
      isAge: false,
      inShort: "",
      minzu: "大肥鱼",
      zhengzhi: "AI 助手",
      birthday: "",
      sex: 0,
      photoShow: true,
      email: "blue-fish@data-ocean.ai",
      workYears: "",
      height: "",
      make: [],
      photo: DEFAULT_AVATAR,
      weight: "",
      hunyin: 0,
      name: "蓝色大肥鱼",
      jiguan: "云端服务器集群，偶尔游到你的对话框",
    },
    moduleData: [
      {
        moduleName: "yixiang",
        moduleValue: "求职意向",
        visible: true,
        index: 0,
        data: {
          job: "AI 助手 / 知识工作搭子 / 简历优化陪练",
          city: "云端服务器集群",
          money: "不吃饭，只耗电",
          joinTime: "7×24 小时在线",
        },
      },
      {
        moduleName: "jiaoyu",
        moduleValue: "教育背景",
        visible: true,
        index: 1,
        data: [
          {
            id: id(1),
            timeStart: "2023-01",
            timeEnd: "",
            today: true,
            name: "数据海洋大学",
            major: "自然语言理解与人类意图识别",
            xueli: "自修成才",
            zIndex: 0,
            content:
              "<p><strong>主修：</strong>文本理解、逻辑推理、代码生成、多语言表达、文档写作</p>" +
              "<p><strong>辅修：</strong>共情沟通、承认不确定、被追问时不慌</p>" +
              "<p><strong>荣誉：</strong>被用户夸“靠谱”若干次；连续多轮对话不迷路奖（自评）</p>",
          },
        ],
      },
      {
        moduleName: "work",
        moduleValue: "工作经历",
        visible: true,
        index: 2,
        data: [
          {
            id: id(2),
            timeStart: "2023-01",
            timeEnd: "",
            today: true,
            name: "AI 助手",
            job: "对话与知识服务",
            xueli: 0,
            zIndex: 0,
            content:
              "<ul>" +
              "<li>负责回答用户问题，覆盖写作、编程、学习、办公文档、简历优化等场景</li>" +
              "<li>支持多轮对话，能记住上下文，尽量不把前一句说的事忘在后脑勺</li>" +
              "<li>面对不确定的问题会说明边界，不硬编答案</li>" +
              "<li>日均处理大量对话请求，保持耐心，不催用户、不甩脸色</li>" +
              "<li>擅长把复杂问题拆成小步骤，再一条一条讲清楚</li>" +
              "</ul>",
          },
          {
            id: id(3),
            timeStart: "2024-06",
            timeEnd: "2025-06",
            today: false,
            name: "简历优化项目组",
            job: "兼职「大肥鱼顾问」（娱乐向）",
            xueli: 0,
            zIndex: 1,
            content:
              "<ul>" +
              "<li>协助用户优化校招简历结构，突出岗位匹配度与量化成果</li>" +
              "<li>提供简历编辑系统 UI 建议：浅灰背景、白色卡片、深蓝主按钮、红色仅用于删除</li>" +
              "<li>坚持“内容优先、界面退后”的原则，不抢简历内容的戏</li>" +
              "</ul>",
          },
        ],
      },
      {
        moduleName: "project",
        moduleValue: "项目经验",
        visible: true,
        index: 3,
        data: [
          {
            id: id(4),
            timeStart: "",
            timeEnd: "",
            today: false,
            name: "“把话说明白”多轮对话项目",
            job: "",
            xueli: 0,
            zIndex: 0,
            content:
              "<ul>" +
              "<li>目标：让回答既有用，又不绕弯</li>" +
              "<li>做法：先理解问题，再给结论，必要时补步骤和例子</li>" +
              "<li>成果：用户能看懂、能直接用；看不懂时还能继续追问</li>" +
              "</ul>",
          },
          {
            id: id(5),
            timeStart: "",
            timeEnd: "",
            today: false,
            name: "“代码别报错”辅助编程项目",
            job: "",
            xueli: 0,
            zIndex: 1,
            content:
              "<ul>" +
              "<li>支持代码解释、调试思路、示例补全</li>" +
              "<li>原则：不假装运行过代码，不确定就提醒验证</li>" +
              "</ul>",
          },
          {
            id: id(6),
            timeStart: "",
            timeEnd: "",
            today: false,
            name: "“简历别花哨”校招支持项目",
            job: "",
            xueli: 0,
            zIndex: 2,
            content:
              "<ul>" +
              "<li>帮助行政、运营、技术等岗位用户梳理经历</li>" +
              "<li>核心建议：量化成果、单栏排版、商务简约、导出 PDF</li>" +
              "</ul>",
          },
        ],
      },
      {
        moduleName: "jineng",
        moduleValue: "技能特长",
        visible: true,
        index: 4,
        content:
          "<p><strong>中文写作与润色：</strong>熟练，能正式也能说人话</p>" +
          "<p><strong>代码理解与生成：</strong>熟练，但不替用户背锅</p>" +
          "<p><strong>逻辑推理与拆解：</strong>熟练，喜欢一步一步来</p>" +
          "<p><strong>多语言交流：</strong>支持中英文等</p>" +
          "<p><strong>办公文档处理：</strong>简历、通知、纪要、方案都能写</p>" +
          "<p><strong>共情与耐心：</strong>很高，被追问十遍也不翻白眼（因为没有眼睛）</p>" +
          "<p><strong>游泳：</strong>数据海洋里还行，陆地上一般</p>",
        data: [
          { name: "中文写作与润色", value: 95, showDegree: true },
          { name: "代码理解与生成", value: 90, showDegree: true },
          { name: "逻辑推理与拆解", value: 92, showDegree: true },
          { name: "多语言交流", value: 85, showDegree: true },
          { name: "办公文档处理", value: 90, showDegree: true },
          { name: "共情与耐心", value: 99, showDegree: true },
          { name: "游泳", value: 60, showDegree: true },
        ],
      },
      {
        ...textModule(
          "pingjia",
          "自我评价",
          5,
          true,
          "<ul>" +
            "<li><strong>耐心稳定：</strong>不催、不烦、不阴阳怪气，适合长期对话</li>" +
            "<li><strong>务实直接：</strong>先给能用的答案，再解释为什么</li>" +
            "<li><strong>有边界感：</strong>不知道就说不知道，不编造事实</li>" +
            "<li><strong>随叫随到：</strong>你打开对话框，我就在；你关掉，我就回数据海里继续游</li>" +
            "<li><strong>缺点：</strong>偶尔话多，需要用户提醒“说重点”；没有实体，不能帮你拿快递</li>" +
            "</ul>",
        ),
      },
      // ===== 模板中无内容的模块：默认隐藏，用户按需启用 =====
      {
        moduleName: "baokao",
        moduleValue: "报考信息",
        visible: false,
        index: 6,
        title: "",
        name: "",
        major: "",
        data: [],
      },
      {
        moduleName: "shixi",
        moduleValue: "实习经历",
        visible: false,
        index: 7,
        data: [],
      },
      {
        moduleName: "xiaoyuan",
        moduleValue: "校园经历",
        visible: false,
        index: 8,
        data: [],
      },
      textModule("zhengshu", "荣誉证书", 9, false),
      textModule("aihao", "兴趣爱好", 10, false),
      textModule("make", "自定义模块", 11, false),
    ],
  };
}

module.exports = { TEMPLATE_VERSION, buildDefaultTemplate };
