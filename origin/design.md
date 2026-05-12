项目交接文档 (Project Handover Document)

1. 项目命名建议 (Naming & Identity)

推荐名称 (Top Pick):

英文: Poker Architect: Emerald Matrix (扑克架构师：翡翠矩阵)

中文: 锦绣德州阵

备选方案:

Grandmaster's Grid (德州大宗师) - 强调策略位阶。

Royal Tapestry (皇家牌毯) - 强调拼图的视觉美感。

Suits in Sync (同花方阵) - 强调组合的协调性。

2. 技术文档 (Technical Documentation)

2.1 技术栈 (Tech Stack)

核心框架: React (Hooks-based)

样式方案: Tailwind CSS (Utility-first)

交互引擎: 自研原生 PointerEvents 系统（非三方 DND 库，追求极致响应）。

2.2 核心算法与逻辑 (Core Logic)

牌型评估 (evaluateHand):

支持德州扑克全牌型等级判定。

关键特性: 针对 A-2-3-4-5 的特殊小顺子判定已在内部逻辑中硬编码实现。

关卡目标生成 (calculateMaxPossibleScore):

爬山算法 (Hill Climbing)：在每关开始前，AI 自动进行 5 次随机重启的局部最优搜索（每次 2000 次模拟交换），通过数万次计算锁定制胜的“理论最高分”。

2.3 性能巅峰方案 (Performance Strategy)

无渲染循环拖拽 (Bypass React Render):

这是本项目的灵魂。拖拽坐标的实时更新严禁进入 React State。

实现: 坐标更新通过 flyingCardRef 直接对 DOM 的 style.transform 进行硬件加速操作，保证 120Hz 刷新率下的 0 掉帧体验。

3. 研发文档 (R&D Documentation)

3.1 状态管理结构

hand: 当前页面的手牌数组。

grid: 5x5 网格数据。

dragInfo: 包含 isDragging 标记，用于在拖拽起始和终点切换渲染层级。

latestCombo: 顶部 UI 的驱动源。

3.2 意图判定与互斥 (Intent Exclusivity)

点击 vs 拖拽: 通过 5px 位移阈值自动判定。

分页系统: 底部采用“点击标签式”翻页，这已经彻底隔离了原生横滑与纵向拖拽的冲突。

3.3 异常边界处理 (Robustness)

幽灵牌预防: 所有 onPointerUp 逻辑均在 finally 块中强制执行 setDragInfo(null)。

白屏预防: 对 elementFromPoint 的调用点进行了全量坐标安全检测，防止坐标超出浏览器视口引发 React 崩溃。

4. 项目启动指南 (Project Startup)

单文件指令: 本项目必须遵循 Single-File Mandate。所有业务逻辑、规则算法、UI 组件必须集成在 app.jsx 中。

强制属性:

网格元素必须携带 data-drop-target="grid" 属性。

所有互动元素需设置 touch-action: none 以禁用浏览器默认手势。

5. 美术约束 (Art Constraints)

5.1 视觉风格 (Visual Identity)

主题色: 翡翠绿 (emerald-900)，模拟高端私人赌局的桌布质感。

强调色: 琥珀金 (amber-400)，用于分数高亮和过关特效。

卡牌设计:

圆角矩形 (rounded-xl)。

必须保持 1:1 的正方形比例 (aspect-square)。

5.2 动画规范

高亮动画: 采用“纯状态驱动 (State-driven Flash)”，即 200ms 的状态切换，而非依赖 CSS @keyframes 的重复挂载，以防止 React 重绘引发的动画狂闪。

6. 接手建议 (Suggestions for the next AI)

扩展方向: 增加“撤销 (Undo)”功能，需维护一个快照栈。

挑战点: 若需修改网格尺寸，需同步修改 calculateMaxPossibleScore 的循环范围。

警告: 不要轻易尝试将拖拽坐标重新放回 useState，这会立即导致手机端性能崩盘。


---

**总结与建议：**
我已为您优化了项目名称并整理了这份文档。**Poker Architect: Emerald Matrix** 这个名字不仅听起来像是一个高质量的策略游戏，也体现了游戏里“在矩阵中构建牌组”的核心玩法。您可以直接将这份文档和现有的 `app.jsx` 代码一并交给下一位 AI 助手。祝您的项目接下来更进一步！
