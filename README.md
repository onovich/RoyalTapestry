# Royal Tapestry

Royal Tapestry is a compact React strategy puzzle about arranging 25 poker cards into the highest-scoring rows, columns, and diagonals.<br/>**Royal Tapestry 是一个紧凑的 React 策略解谜游戏，玩家需要把 25 张扑克牌排列成高分的行、列与对角线牌型。**

## Features

- Poker hand scoring covers royal flush, straight flush, four of a kind, full house, flush, straight, three of a kind, two pair, one pair, and high card.<br/>**牌型计分覆盖皇家同花顺、同花顺、四条、葫芦、同花、顺子、三条、两对、一对和高牌。**
- Each level draws 25 cards and estimates a target score through a local hill-climbing search.<br/>**每一关抽取 25 张牌，并通过本地爬山搜索估算目标分数。**
- The codebase has been initialized as a Vite and React app with separated data, engine logic, hooks, and view modules.<br/>**代码库已初始化为 Vite 与 React 应用，并拆分为数据、引擎逻辑、Hook 和视图模块。**
- The pure card generation, score evaluation, board scoring, and target estimation logic now live outside the React view layer, preparing the project for a future Unity port.<br/>**纯牌组生成、牌型评估、棋盘计分和目标分估算逻辑已从 React 视图层中分离，为未来迁移到 Unity 做准备。**

## Project Structure

- `src/data/` stores card constants, score tables, and board parameters.<br/>**`src/data/` 存放扑克牌常量、计分表和棋盘参数。**
- `src/logic/engine/` stores framework-independent deck and scoring logic.<br/>**`src/logic/engine/` 存放不依赖框架的牌组与计分逻辑。**
- `src/logic/hooks/` bridges React state with the pure engine.<br/>**`src/logic/hooks/` 负责把 React 状态与纯引擎逻辑连接起来。**
- `src/view/components/` stores reusable presentational components.<br/>**`src/view/components/` 存放可复用的展示组件。**
- `src/view/screens/` stores the assembled game screen.<br/>**`src/view/screens/` 存放组装后的游戏主界面。**

## Development

Install dependencies with npm.<br/>**使用 npm 安装依赖。**

```bash
npm install
```

Run the local development server.<br/>**启动本地开发服务器。**

```bash
npm run dev
```

Build the production bundle.<br/>**构建生产版本。**

```bash
npm run build
```

Preview the production bundle locally.<br/>**在本地预览生产构建结果。**

```bash
npm run preview
```

## Deployment

The repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml` that builds `dist/` and deploys it through GitHub Pages.<br/>**仓库包含 `.github/workflows/deploy.yml` 工作流，会构建 `dist/` 并通过 GitHub Pages 发布。**

Because this is a Vite project hosted under a repository path, `vite.config.js` sets `base` to `/RoyalTapestry/`.<br/>**因为这是部署在仓库子路径下的 Vite 项目，`vite.config.js` 已将 `base` 设置为 `/RoyalTapestry/`。**
