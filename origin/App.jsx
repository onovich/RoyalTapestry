import React, { useState, useEffect, useRef } from 'react';

// --- 常量与配置 ---
const SUITS = ['♥', '♦', '♣', '♠'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RANK_VALUES = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

const SCORE_TABLE = {
  'Royal Flush': { name: '皇家同花顺', short: '皇顺', score: 100, desc: '同花色的A, K, Q, J, 10' },
  'Straight Flush': { name: '同花顺', short: '同顺', score: 75, desc: '五张同花色且点数连续的牌' },
  'Four of a Kind': { name: '四条', short: '四条', score: 50, desc: '四张同点数的牌' },
  'Full House': { name: '葫芦', short: '葫芦', score: 25, desc: '三条加上一对' },
  'Flush': { name: '同花', short: '同花', score: 20, desc: '五张同花色的牌' },
  'Straight': { name: '顺子', short: '顺子', score: 15, desc: '五张点数连续的牌' },
  'Three of a Kind': { name: '三条', short: '三条', score: 10, desc: '三张同点数的牌' },
  'Two Pair': { name: '两对', short: '两对', score: 5, desc: '两个不同点数的一对' },
  'One Pair': { name: '一对', short: '一对', score: 2, desc: '两张同点数的牌' },
  'High Card': { name: '高牌', short: '高牌', score: 0, desc: '不符合以上任何牌型' }
};

// --- 扑克牌逻辑函数 ---
const createDeck = () => {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ id: `${rank}${suit}`, rank, suit, value: RANK_VALUES[rank] });
    }
  }
  return deck;
};

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const evaluateHand = (cards) => {
  if (cards.length < 5 || cards.includes(null)) return { name: '', short: '', score: 0 };

  const values = cards.map(c => c.value).sort((a, b) => b - a);
  const suits = cards.map(c => c.suit);
  
  const isFlush = suits.every(s => s === suits[0]);
  
  let isStraight = true;
  for (let i = 0; i < 4; i++) {
    if (values[i] !== values[i + 1] + 1) {
      isStraight = false;
      break;
    }
  }
  if (!isStraight && values[0] === 14 && values[1] === 5 && values[2] === 4 && values[3] === 3 && values[4] === 2) {
    isStraight = true;
  }

  const counts = {};
  values.forEach(v => counts[v] = (counts[v] || 0) + 1);
  const frequencies = Object.values(counts).sort((a, b) => b - a);

  if (isStraight && isFlush && values[0] === 14 && values[1] === 13) return SCORE_TABLE['Royal Flush'];
  if (isStraight && isFlush) return SCORE_TABLE['Straight Flush'];
  if (frequencies[0] === 4) return SCORE_TABLE['Four of a Kind'];
  if (frequencies[0] === 3 && frequencies[1] === 2) return SCORE_TABLE['Full House'];
  if (isFlush) return SCORE_TABLE['Flush'];
  if (isStraight) return SCORE_TABLE['Straight'];
  if (frequencies[0] === 3) return SCORE_TABLE['Three of a Kind'];
  if (frequencies[0] === 2 && frequencies[1] === 2) return SCORE_TABLE['Two Pair'];
  if (frequencies[0] === 2) return SCORE_TABLE['One Pair'];
  
  return SCORE_TABLE['High Card'];
};

const calculateMaxPossibleScore = (initialCards) => {
  let bestGrid = [...initialCards];
  const evaluateGrid1D = (grid1D) => {
    let total = 0;
    for (let i = 0; i < 5; i++) total += evaluateHand(grid1D.slice(i * 5, i * 5 + 5)).score;
    for (let i = 0; i < 5; i++) total += evaluateHand([grid1D[i], grid1D[i+5], grid1D[i+10], grid1D[i+15], grid1D[i+20]]).score;
    total += evaluateHand([grid1D[0], grid1D[6], grid1D[12], grid1D[18], grid1D[24]]).score;
    total += evaluateHand([grid1D[4], grid1D[8], grid1D[12], grid1D[16], grid1D[20]]).score;
    return total;
  };
  let bestScore = evaluateGrid1D(bestGrid);
  for (let restarts = 0; restarts < 5; restarts++) {
    let currentGrid = shuffleArray([...initialCards]);
    let currentScore = evaluateGrid1D(currentGrid);
    for (let i = 0; i < 2000; i++) {
      const idx1 = Math.floor(Math.random() * 25);
      const idx2 = Math.floor(Math.random() * 25);
      [currentGrid[idx1], currentGrid[idx2]] = [currentGrid[idx2], currentGrid[idx1]];
      const newScore = evaluateGrid1D(currentGrid);
      if (newScore >= currentScore) currentScore = newScore; 
      else [currentGrid[idx1], currentGrid[idx2]] = [currentGrid[idx2], currentGrid[idx1]];
    }
    if (currentScore > bestScore) bestScore = currentScore;
  }
  return bestScore;
};

// --- UI 弹窗组件 ---
const RulesModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-emerald-900 border border-emerald-600 rounded-2xl p-4 sm:p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-emerald-900 pb-3 mb-2 flex justify-between items-center border-b border-emerald-700 z-10">
          <h2 className="text-lg font-bold text-emerald-100 flex items-center gap-2">
            <span className="text-amber-400">♦</span> 牌型规则 <span className="text-red-400">♥</span>
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-emerald-800 hover:bg-emerald-700 flex items-center justify-center text-emerald-300 font-bold">✕</button>
        </div>
        <div className="space-y-3 mt-4">
          {Object.values(SCORE_TABLE).map((rule, idx) => (
            <div key={idx} className="bg-emerald-800/50 rounded-lg p-3 border border-emerald-700/50 flex items-start gap-3">
              <div className="w-12 h-12 shrink-0 bg-emerald-950 rounded-lg flex flex-col items-center justify-center border border-emerald-700 shadow-inner">
                <span className="text-amber-400 font-black text-lg">{rule.score}</span>
                <span className="text-[10px] text-emerald-400 -mt-1">分</span>
              </div>
              <div>
                <div className="font-bold text-white mb-0.5">{rule.name}</div>
                <div className="text-xs text-emerald-200/80 leading-relaxed">{rule.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const WinModal = ({ isOpen, score, targetScore, level, onNextLevel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 z-[120] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-emerald-900 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-[0_0_40px_rgba(245,158,11,0.3)] relative text-center transform animate-pop-in">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-500 mb-2">
          恭喜过关！
        </h2>
        <p className="text-emerald-200 text-sm mb-6">您成功破解了第 {level} 关的理论最高分</p>
        
        <div className="bg-emerald-950/50 rounded-2xl p-4 mb-6 border border-emerald-800 flex justify-around">
           <div className="flex flex-col items-center">
             <span className="text-[10px] text-emerald-400 mb-1">目标分数</span>
             <span className="text-xl font-bold text-white/70">{targetScore}</span>
           </div>
           <div className="w-px bg-emerald-800"></div>
           <div className="flex flex-col items-center">
             <span className="text-[10px] text-amber-300 mb-1">您的最终得分</span>
             <span className="text-3xl font-black text-amber-400">{score}</span>
           </div>
        </div>

        <button 
          onClick={onNextLevel}
          className="w-full py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 rounded-xl text-emerald-950 font-black text-lg shadow-lg transform transition active:scale-95"
        >
          进入下一关
        </button>
      </div>
    </div>
  );
};

// 安全获取手指/鼠标坐标
const getPointerCoords = (e) => {
  if (typeof e.clientX === 'number' && typeof e.clientY === 'number') {
    return { x: e.clientX, y: e.clientY };
  }
  if (e.changedTouches && e.changedTouches.length > 0) {
    return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  }
  if (e.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  return null;
};

// --- 主组件 ---
export default function App() {
  const [level, setLevel] = useState(1);
  const [hand, setHand] = useState([]);
  const [grid, setGrid] = useState(Array(5).fill(null).map(() => Array(5).fill(null)));
  const [targetScore, setTargetScore] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);

  const [latestCombo, setLatestCombo] = useState(null); 
  const [highlightCells, setHighlightCells] = useState([]); 
  const [isFlashOn, setIsFlashOn] = useState(false);
  
  const [clickCycleState, setClickCycleState] = useState({ r: -1, c: -1, comboIndex: 0 }); 
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isWinModalOpen, setIsWinModalOpen] = useState(false);

  // 【物理级拖拽状态】
  const [dragInfo, setDragInfo] = useState(null); 
  
  // 【核心修复：零延迟防截持同步锁】
  const dragCoordsRef = useRef({ 
      startX: 0, 
      startY: 0, 
      intentDecided: false,
      isActiveLock: false // 新增同步锁：手指按在卡牌上的瞬间立刻锁死，阻断任何原生滚动
  });
  
  const flyingCardRef = useRef(null);

  // 分页控制
  const scrollContainerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  
  const prevScoresRef = useRef({ rows: [], cols: [], diag1: 0, diag2: 0 });
  const highlightTimerRef = useRef(null);

  const startNewGame = (isNextLevel = false) => {
    if (!isNextLevel) setLevel(1);
    
    setIsInitializing(true);
    setLatestCombo(null);
    setHighlightCells([]);
    setIsFlashOn(false);
    setDragInfo(null);
    if (dragCoordsRef.current) dragCoordsRef.current.isActiveLock = false;
    
    setCurrentPage(0);
    setIsWinModalOpen(false);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    
    setTimeout(() => {
      const deck = createDeck();
      const shuffled = shuffleArray(deck);
      const drawnCards = shuffled.slice(0, 25);
      const estimatedMax = calculateMaxPossibleScore(drawnCards);
      
      setTargetScore(estimatedMax);
      setHand(drawnCards);
      setGrid(Array(5).fill(null).map(() => Array(5).fill(null)));
      prevScoresRef.current = { rows: Array(5).fill(0), cols: Array(5).fill(0), diag1: 0, diag2: 0 };
      setIsInitializing(false);
      
      if (scrollContainerRef.current) {
         scrollContainerRef.current.scrollLeft = 0;
      }
    }, 100);
  };

  useEffect(() => { startNewGame(); }, []);

  // 【极限防御拦截】：彻底解决拖牌时带动页面的 Bug
  // 因为没有使用依赖项 []，这个监听器在挂载后会一直存在
  // 它的判断依据是同步的 dragCoordsRef.current.isActiveLock，0延迟！
  useEffect(() => {
    const handleNativeTouchMove = (e) => {
      if (dragCoordsRef.current?.isActiveLock) {
        if (e.cancelable) {
            e.preventDefault();
        }
      }
    };
    // 必须使用 passive: false 才能调用 preventDefault
    document.addEventListener('touchmove', handleNativeTouchMove, { passive: false });
    return () => document.removeEventListener('touchmove', handleNativeTouchMove);
  }, []);

  // 手牌滚动监听
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const page = Math.round(container.scrollLeft / container.clientWidth);
      setCurrentPage(page);
    };
    container.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hand.length]);


  // --- 计分与高亮触发逻辑 ---
  useEffect(() => {
    if (isInitializing) return;

    const currentRows = grid.map(row => evaluateHand(row));
    const currentCols = Array(5).fill(null).map((_, c) => evaluateHand([grid[0][c], grid[1][c], grid[2][c], grid[3][c], grid[4][c]]));
    const currentDiag1 = evaluateHand([grid[0][0], grid[1][1], grid[2][2], grid[3][3], grid[4][4]]);
    const currentDiag2 = evaluateHand([grid[0][4], grid[1][3], grid[2][2], grid[3][1], grid[4][0]]);

    let newCombo = null;
    let cellsToHighlight = [];

    currentRows.forEach((res, r) => {
      if (res.score > 0 && res.score !== prevScoresRef.current.rows[r]) {
        newCombo = { name: res.name, score: res.score, type: 'row', index: r };
        cellsToHighlight = [0,1,2,3,4].map(c => ({r, c}));
      }
    });
    if (!newCombo) {
      currentCols.forEach((res, c) => {
        if (res.score > 0 && res.score !== prevScoresRef.current.cols[c]) {
          newCombo = { name: res.name, score: res.score, type: 'col', index: c };
          cellsToHighlight = [0,1,2,3,4].map(r => ({r, c}));
        }
      });
    }
    if (!newCombo && currentDiag1.score > 0 && currentDiag1.score !== prevScoresRef.current.diag1) {
      newCombo = { name: currentDiag1.name, score: currentDiag1.score, type: 'diag', index: 1 };
      cellsToHighlight = [0,1,2,3,4].map(i => ({r: i, c: i}));
    }
    if (!newCombo && currentDiag2.score > 0 && currentDiag2.score !== prevScoresRef.current.diag2) {
      newCombo = { name: currentDiag2.name, score: currentDiag2.score, type: 'diag', index: 2 };
      cellsToHighlight = [0,1,2,3,4].map(i => ({r: i, c: 4-i}));
    }

    if (newCombo) triggerHighlight(newCombo, cellsToHighlight);

    prevScoresRef.current = {
      rows: currentRows.map(r => r.score),
      cols: currentCols.map(c => c.score),
      diag1: currentDiag1.score,
      diag2: currentDiag2.score
    };
  }, [grid, isInitializing]);

  const triggerHighlight = (comboInfo, cells) => {
    setLatestCombo(comboInfo);
    setHighlightCells(cells);
    
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    
    setIsFlashOn(true); 
    highlightTimerRef.current = setTimeout(() => {
        setIsFlashOn(false); 
        highlightTimerRef.current = setTimeout(() => {
            setIsFlashOn(true); 
            highlightTimerRef.current = setTimeout(() => {
                setIsFlashOn(false); 
                setHighlightCells([]); 
            }, 250);
        }, 150);
    }, 250);
  };

  const getCardCombos = (r, c) => {
    const combos = [];
    const rowRes = evaluateHand(grid[r]);
    if (rowRes.score > 0) combos.push({ name: rowRes.name, score: rowRes.score, type: 'row', index: r, cells: [0,1,2,3,4].map(col => ({r, c: col})) });
    
    const colCards = [grid[0][c], grid[1][c], grid[2][c], grid[3][c], grid[4][c]];
    const colRes = evaluateHand(colCards);
    if (colRes.score > 0) combos.push({ name: colRes.name, score: colRes.score, type: 'col', index: c, cells: [0,1,2,3,4].map(row => ({r: row, c})) });
    
    if (r === c) {
      const diag1Res = evaluateHand([grid[0][0], grid[1][1], grid[2][2], grid[3][3], grid[4][4]]);
      if (diag1Res.score > 0) combos.push({ name: diag1Res.name, score: diag1Res.score, type: 'diag', index: 1, cells: [0,1,2,3,4].map(i => ({r: i, c: i})) });
    }
    
    if (r + c === 4) {
      const diag2Res = evaluateHand([grid[0][4], grid[1][3], grid[2][2], grid[3][1], grid[4][0]]);
      if (diag2Res.score > 0) combos.push({ name: diag2Res.name, score: diag2Res.score, type: 'diag', index: 2, cells: [0,1,2,3,4].map(i => ({r: i, c: 4-i})) });
    }
    return combos;
  };

  // --- 实时得分计算与过关检测 ---
  const rowScores = grid.map(row => evaluateHand(row));
  const colScores = Array(5).fill(null).map((_, c) => evaluateHand([grid[0][c], grid[1][c], grid[2][c], grid[3][c], grid[4][c]]));
  const diag1Score = evaluateHand([grid[0][0], grid[1][1], grid[2][2], grid[3][3], grid[4][4]]);
  const diag2Score = evaluateHand([grid[0][4], grid[1][3], grid[2][2], grid[3][1], grid[4][0]]);

  const totalScore = rowScores.reduce((acc, curr) => acc + curr.score, 0) +
                     colScores.reduce((acc, curr) => acc + curr.score, 0) +
                     diag1Score.score + diag2Score.score;

  useEffect(() => {
     if (hand.length === 0 && totalScore >= targetScore && targetScore > 0 && !isInitializing) {
         const timer = setTimeout(() => {
             setIsWinModalOpen(true);
         }, 800);
         return () => clearTimeout(timer);
     }
  }, [hand.length, totalScore, targetScore, isInitializing]);


  const handleMove = (source, target) => {
    if (!target) return;
    if (source.type === target.type) {
      if (source.type === 'hand' && source.index === target.index) return;
      if (source.type === 'grid' && source.r === target.r && source.c === target.c) return;
    }

    const newHand = [...hand];
    const newGrid = grid.map(row => [...row]);

    let sourceCard = source.type === 'hand' ? newHand[source.index] : newGrid[source.r][source.c];
    if (!sourceCard) return; 

    let targetCard = target.type === 'hand' ? (target.index !== undefined && target.index !== null ? newHand[target.index] : null) : newGrid[target.r][target.c];

    if (source.type === 'hand') {
      if (target.type === 'grid') {
        newGrid[target.r][target.c] = sourceCard;
        if (targetCard) newHand[source.index] = targetCard;
        else newHand.splice(source.index, 1);
      } else {
        newHand[source.index] = targetCard;
        newHand[target.index] = sourceCard;
      }
    } else {
      if (target.type === 'grid') {
        newGrid[target.r][target.c] = sourceCard;
        newGrid[source.r][source.c] = targetCard;
      } else {
        newGrid[source.r][source.c] = targetCard;
        if (target.index !== undefined && target.index !== null && targetCard) {
            newHand[target.index] = sourceCard;
        } else {
            newHand.push(sourceCard);
        }
      }
    }

    setHand(newHand.filter(Boolean));
    setGrid(newGrid);
    setClickCycleState({ r: -1, c: -1, comboIndex: 0 }); 
  };


  // --- 无重绘物理级拖拽系统 ---
  const onPointerDownCard = (e, locationInfo, card) => {
    if (!card) return;
    if (e.button === 2) return; 
    
    // 如果是网格卡牌，直接拦截 pointerdown 的默认事件
    if (e.cancelable && locationInfo.type === 'grid') {
        e.preventDefault();
    }
    
    const coords = getPointerCoords(e);
    if (!coords) return;

    // 0 延迟，直接上锁！保证浏览器原生滚动绝对无法触发
    dragCoordsRef.current = {
        startX: coords.x,
        startY: coords.y,
        intentDecided: false,
        isActiveLock: true 
    };

    setDragInfo({
        source: locationInfo,
        card: card,
        isDragging: false
    });
  };

  const handleGlobalPointerMove = (e) => {
    if (!dragInfo) return;

    const coords = getPointerCoords(e);
    if (!coords) return;

    const dx = coords.x - dragCoordsRef.current.startX;
    const dy = coords.y - dragCoordsRef.current.startY;

    if (!dragCoordsRef.current.intentDecided) {
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            dragCoordsRef.current.intentDecided = true;
            setDragInfo(prev => ({ ...prev, isDragging: true }));
            if (navigator.vibrate) navigator.vibrate(20);
        }
    } 
    
    if (dragInfo.isDragging && flyingCardRef.current) {
        if (e.cancelable) e.preventDefault(); 
        flyingCardRef.current.style.left = `${coords.x}px`;
        flyingCardRef.current.style.top = `${coords.y}px`;
    }
  };

  const handleGlobalPointerUp = (e) => {
    if (!dragInfo) {
      if (dragCoordsRef.current) dragCoordsRef.current.isActiveLock = false;
      return;
    }

    try {
        if (dragInfo.isDragging) {
            const coords = getPointerCoords(e);
            const clientX = coords ? coords.x : dragCoordsRef.current.startX;
            const clientY = coords ? coords.y : dragCoordsRef.current.startY;
            
            let dropTarget = null;
            try {
                if (clientX >= 0 && clientY >= 0 && clientX <= window.innerWidth && clientY <= window.innerHeight) {
                    dropTarget = document.elementFromPoint(clientX, clientY);
                }
            } catch (err) {
                console.warn("落点坐标越界", err);
            }
            
            const targetEl = dropTarget?.closest('[data-drop-target]');
            
            if (targetEl && targetEl.getAttribute('data-drop-target') === 'grid') {
                const targetRAttr = targetEl.getAttribute('data-r');
                const targetCAttr = targetEl.getAttribute('data-c');
                if (targetRAttr !== null && targetCAttr !== null) {
                    handleMove(dragInfo.source, { type: 'grid', r: parseInt(targetRAttr, 10), c: parseInt(targetCAttr, 10) });
                }
            } else {
                if (dragInfo.source.type === 'grid') {
                    handleMove(dragInfo.source, { type: 'hand' });
                }
            }
        } else {
            const { source, card } = dragInfo;
            if (source.type === 'grid' && card) {
                const { r, c } = source;
                const combos = getCardCombos(r, c);
                if (combos.length > 0) {
                    let nextComboIndex = 0;
                    if (clickCycleState.r === r && clickCycleState.c === c) {
                        nextComboIndex = (clickCycleState.comboIndex + 1) % combos.length;
                    }
                    const comboToShow = combos[nextComboIndex];
                    triggerHighlight(comboToShow, comboToShow.cells);
                    setClickCycleState({ r, c, comboIndex: nextComboIndex });
                } else {
                    setClickCycleState({ r: -1, c: -1, comboIndex: 0 });
                }
            }
        }
    } catch (error) {
        console.error("拖拽结算异常:", error);
    } finally {
        // 解除锁和拖拽状态
        if (dragCoordsRef.current) dragCoordsRef.current.isActiveLock = false;
        setDragInfo(null);
    }
  };

  // --- 渲染函数 ---
  const renderCard = (card, isTargetInHighlightList, isBeingDragged = false) => {
    if (!card) return null;
    const isRed = card.suit === '♥' || card.suit === '♦';
    const showHighlightVisuals = isTargetInHighlightList && isFlashOn;
    
    return (
      <div
        className={`w-full h-full rounded-lg sm:rounded-xl bg-white border flex flex-col items-center justify-center overflow-hidden
          ${showHighlightVisuals ? 'border-amber-400 scale-[1.08] shadow-[0_0_15px_rgba(251,191,36,0.8)] z-10' : 'border-gray-300 shadow-sm scale-100 z-0'}
          ${isRed ? 'text-red-600' : 'text-gray-900'}
        `}
        style={{ transition: 'transform 0.1s ease-out, box-shadow 0.1s ease-out, border-color 0.1s' }}
      >
        <div className="absolute top-0.5 left-1 text-[10px] sm:text-xs font-bold leading-none">{card.rank}</div>
        <div className="text-xl sm:text-3xl leading-none mt-1">{card.suit}</div>
        {showHighlightVisuals && <div className="absolute inset-0 bg-amber-400/30"></div>}
      </div>
    );
  };

  const isCellHighlighted = (r, c) => highlightCells.some(cell => cell.r === r && cell.c === c);
  
  const totalPages = Math.ceil(hand.length / 5);

  return (
    <div 
      className="min-h-[100dvh] w-full bg-emerald-800 text-white flex flex-col font-sans overflow-hidden relative select-none"
      style={{ 
          // 全局双重物理级锁定：防止 iOS / Android 的滚动和回弹效果
          WebkitUserSelect: 'none', WebkitTouchCallout: 'none', userSelect: 'none', 
          touchAction: 'none', overscrollBehavior: 'none' 
      }} 
      onPointerMove={handleGlobalPointerMove}
      onPointerUp={handleGlobalPointerUp}
      onPointerCancel={handleGlobalPointerUp} 
      onPointerLeave={handleGlobalPointerUp}  
      onContextMenu={e => e.preventDefault()}
    >
      {/* 注入全局底层保护，防止页面意外拥有滚动条 */}
      <style dangerouslySetInnerHTML={{__html: `
        html, body { overflow: hidden !important; touch-action: none !important; overscroll-behavior: none !important; margin: 0; height: 100%; width: 100%; }
        @keyframes slide-down { 0% { transform: translateY(-10px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        @keyframes fade-in { 0% { opacity: 0; backdrop-filter: blur(0px); } 100% { opacity: 1; backdrop-filter: blur(4px); } }
        @keyframes pop-in { 0% { transform: scale(0.8) translateY(20px); opacity: 0; } 60% { transform: scale(1.05) translateY(-5px); } 100% { transform: scale(1) translateY(0); opacity: 1; } }
        .animate-slide-down { animation: slide-down 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        .animate-pop-in { animation: pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 1rem); }
      `}} />

      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      
      <WinModal 
        isOpen={isWinModalOpen} 
        score={totalScore} 
        targetScore={targetScore} 
        level={level}
        onNextLevel={() => {
           setLevel(l => l + 1);
           startNewGame(true); 
        }} 
      />

      {/* 悬浮的拖拽中卡牌 */}
      {dragInfo?.isDragging && (
        <div 
          ref={flyingCardRef}
          className="fixed z-[100] pointer-events-none drop-shadow-2xl scale-110 opacity-95 transition-none"
          style={{
             left: dragCoordsRef.current.startX + 'px', 
             top: dragCoordsRef.current.startY + 'px',
             transform: 'translate(-50%, -50%)',
             width: '60px', height: '60px' 
          }}
        >
          {renderCard(dragInfo.card, false)}
        </div>
      )}

      {/* 顶部信息栏 */}
      <div className="bg-emerald-900 shadow-md p-3 pb-2 flex justify-between items-end z-20 shrink-0">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-1 text-emerald-100">
             <span className="text-red-400">♥</span> 扑克方块
          </h1>
          <div className="flex gap-2 mt-1">
             <button onClick={() => startNewGame(false)} className="px-3 py-1 bg-emerald-600 active:bg-emerald-700 rounded-md text-xs font-medium border border-emerald-500">重新开始</button>
             <button onClick={() => setIsRulesOpen(true)} className="px-3 py-1 bg-emerald-800 active:bg-emerald-700 rounded-md text-xs font-medium border border-emerald-600 text-emerald-300">❓ 规则</button>
          </div>
        </div>
        
        <div className="flex gap-3 sm:gap-4 text-center items-end">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-emerald-400 mb-0.5 tracking-wider">关卡</span>
            <span className="text-lg font-bold text-emerald-200 leading-none">{level}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-emerald-400 mb-0.5">目标分数</span>
            <span className="text-lg font-bold text-white/80 leading-none">{isInitializing ? '...' : targetScore}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-amber-200 mb-0.5">当前得分</span>
            <span className="text-2xl font-black text-amber-400 leading-none drop-shadow-md">{totalScore}</span>
          </div>
        </div>
      </div>

      {/* 游戏主体区域 */}
      <div className="flex-1 p-2 sm:p-4 flex flex-col items-center justify-center min-h-0">
        
        <div className="w-full max-w-md h-10 mb-2 flex items-center justify-center shrink-0">
           {latestCombo ? (
              <div key={`${latestCombo.type}-${latestCombo.index}-${Date.now()}`} className="animate-slide-down flex items-center gap-2 bg-amber-900/80 border border-amber-500/50 px-4 py-1.5 rounded-full shadow-lg">
                 <span className="text-amber-200 text-sm font-medium">✨ {latestCombo.name}</span>
                 <span className="bg-amber-500 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-sm">+{latestCombo.score}</span>
              </div>
           ) : (
              <div className="text-center text-xs text-emerald-200/80">
                 {hand.length === 0 && totalScore < targetScore 
                    ? <span className="text-amber-300 animate-pulse">分数未达标，请在网格内拖拽互换卡牌继续调整！</span>
                    : '拖拽卡牌放置。点击底部标签翻页查看手牌'
                 }
              </div>
           )}
        </div>

        <div className="w-full max-w-md relative shrink-0">
          <div className="absolute -top-4 -left-2 text-[10px] font-bold z-10 bg-emerald-800/80 rounded px-1">
             ↘ <span className={diag1Score.score > 0 ? 'text-amber-300' : 'text-emerald-500'}>{diag1Score.score}</span>
          </div>
          <div className="absolute -top-4 -right-2 text-[10px] font-bold z-10 bg-emerald-800/80 rounded px-1">
             ↙ <span className={diag2Score.score > 0 ? 'text-amber-300' : 'text-emerald-500'}>{diag2Score.score}</span>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-1">
             <div className="grid grid-cols-5 gap-1 sm:gap-2 p-1 sm:p-2 bg-emerald-900/50 rounded-xl border border-emerald-700/50 relative">
               {grid.map((row, r) => (
                  row.map((cell, c) => {
                    const isInHighlightList = isCellHighlighted(r, c);
                    const isBeingDragged = dragInfo?.isDragging && dragInfo?.source.type === 'grid' && dragInfo?.source.r === r && dragInfo?.source.c === c;

                    return (
                      <div 
                        key={`cell-${r}-${c}`}
                        data-drop-target="grid" 
                        data-r={r} 
                        data-c={c}
                        className={`aspect-square relative rounded-lg sm:rounded-xl cursor-pointer
                          ${cell ? 'bg-transparent' : 'border border-dashed border-emerald-600/50 bg-emerald-800/40 transition-colors'}
                          ${(isInHighlightList && isFlashOn) ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-emerald-900 z-10' : 'ring-0 z-0'}
                          ${isBeingDragged ? 'opacity-0' : 'opacity-100'} 
                        `}
                        onPointerDown={(e) => onPointerDownCard(e, {type: 'grid', r, c}, cell)}
                      >
                        {renderCard(cell, isInHighlightList)}
                      </div>
                    );
                  })
               ))}
             </div>

             <div className="grid grid-rows-5 gap-1 sm:gap-2 py-1 sm:py-2 px-1">
                {rowScores.map((score, r) => {
                  const isHighlighted = latestCombo?.type === 'row' && latestCombo?.index === r && highlightCells.length > 0;
                  return (
                  <div key={`row-score-${r}`} className={`flex flex-col items-center justify-center min-w-[24px] transition-transform ${isHighlighted ? 'scale-125' : ''}`}>
                    <span className={`text-sm sm:text-base font-bold leading-none ${score.score > 0 ? (isHighlighted ? 'text-white' : 'text-amber-400') : 'text-emerald-600'}`}>{score.score}</span>
                    {score.score > 0 && <span className={`text-[8px] sm:text-[10px] leading-none mt-1 ${isHighlighted ? 'text-amber-200' : 'text-emerald-300'}`}>{score.short}</span>}
                  </div>
                )})}
             </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-1 mt-1">
             <div className="grid grid-cols-5 gap-1 sm:gap-2 px-1 sm:px-2">
                {colScores.map((score, c) => {
                  const isHighlighted = latestCombo?.type === 'col' && latestCombo?.index === c && highlightCells.length > 0;
                  return (
                  <div key={`col-score-${c}`} className={`flex flex-col items-center justify-start pt-1 transition-transform ${isHighlighted ? 'scale-125' : ''}`}>
                    <span className={`text-sm sm:text-base font-bold leading-none ${score.score > 0 ? (isHighlighted ? 'text-white' : 'text-amber-400') : 'text-emerald-600'}`}>{score.score}</span>
                    {score.score > 0 && <span className={`text-[8px] sm:text-[10px] leading-none mt-1 ${isHighlighted ? 'text-amber-200' : 'text-emerald-300'}`}>{score.short}</span>}
                  </div>
                )})}
             </div>
             <div className="min-w-[24px]"></div> 
          </div>
        </div>
      </div>

      {/* 手牌区 & 分页数字标签 */}
      <div className="bg-emerald-900 border-t border-emerald-700 pt-2 pb-safe relative z-30 shadow-[0_-5px_15px_rgba(0,0,0,0.3)] shrink-0">
        
        <div 
           ref={scrollContainerRef}
           className="flex gap-2 overflow-x-hidden h-14 sm:h-16 px-4"
           // 确保内部不会有原生的拖拽平移事件干扰
           style={{ touchAction: 'none', scrollBehavior: 'smooth' }} 
        >
          {hand.map((card, index) => {
            const isBeingDragged = dragInfo?.isDragging && dragInfo?.source.type === 'hand' && dragInfo?.source.index === index;
            return (
              <div 
                key={card.id} 
                className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 relative cursor-pointer
                  ${isBeingDragged ? 'opacity-0' : 'opacity-100'}
                `}
                onPointerDown={(e) => onPointerDownCard(e, {type: 'hand', index}, card)}
              >
                {renderCard(card, false)}
              </div>
            );
          })}
          {hand.length === 0 && (
             <div className="w-full h-14 flex items-center justify-center text-emerald-600/50 text-sm pointer-events-none">
                {totalScore >= targetScore && !isInitializing ? '过关条件已达成！' : '手牌已空，可在上方互换调整'}
             </div>
          )}
        </div>

        {/* 底部翻页数字标签 */}
        {totalPages > 1 && (
            <div className="mt-3 mb-1 px-4 h-6 flex items-center justify-center gap-2">
               {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                        if (scrollContainerRef.current) {
                            scrollContainerRef.current.scrollTo({
                                left: i * scrollContainerRef.current.clientWidth,
                                behavior: 'smooth'
                            });
                        }
                    }}
                    className={`min-w-[32px] h-6 px-2 rounded-md flex items-center justify-center text-[11px] font-bold transition-all shadow-sm
                        ${currentPage === i ? 'bg-amber-400 text-amber-900 scale-110 shadow-md' : 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-800'}
                    `}
                  >
                    {i + 1}
                  </button>
               ))}
            </div>
        )}
      </div>
    </div>
  );
}