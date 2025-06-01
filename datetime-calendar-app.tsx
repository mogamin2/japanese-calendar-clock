import React, { useState, useEffect } from 'react';
import { Calendar, Clock, RefreshCw, Sunrise, Moon } from 'lucide-react';

const DateTimeCalendarApp = () => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  // 曜日の配列
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  // 2025年の日本の祝日
  const holidays: { [key: string]: string } = {
    '2025-1-1': '元日',
    '2025-1-13': '成人の日',
    '2025-2-11': '建国記念の日',
    '2025-2-23': '天皇誕生日',
    '2025-2-24': '振替休日',
    '2025-3-20': '春分の日',
    '2025-4-29': '昭和の日',
    '2025-5-3': '憲法記念日',
    '2025-5-4': 'みどりの日',
    '2025-5-5': 'こどもの日',
    '2025-5-6': '振替休日',
    '2025-7-21': '海の日',
    '2025-8-11': '山の日',
    '2025-9-15': '敬老の日',
    '2025-9-23': '秋分の日',
    '2025-10-13': 'スポーツの日',
    '2025-11-3': '文化の日',
    '2025-11-23': '勤労感謝の日',
    '2025-11-24': '振替休日'
  };

  // 六曜を計算
  const getRokuyo = (date: Date) => {
    const rokuyoNames = ['大安', '赤口', '先勝', '友引', '先負', '仏滅'];
    // 簡易的な計算（実際の六曜計算は旧暦が必要で複雑）
    const seed = date.getDate() + date.getMonth() + 1;
    return rokuyoNames[seed % 6];
  };

  // 月齢を計算（簡易版）
  const getMoonAge = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const c = Math.floor(year / 100);
    const y = year % 100;
    const m = month < 3 ? month + 12 : month;
    const adjustedYear = month < 3 ? y - 1 : y;
    
    const d = day + Math.floor(26 * (m + 1) / 10) + adjustedYear + Math.floor(adjustedYear / 4) + Math.floor(c / 4) - 2 * c;
    const moonAge = d % 30;
    
    if (moonAge < 2) return '新月';
    else if (moonAge < 6) return '三日月';
    else if (moonAge < 9) return '上弦';
    else if (moonAge < 13) return '十三夜';
    else if (moonAge < 17) return '満月';
    else if (moonAge < 20) return '十八夜';
    else if (moonAge < 24) return '下弦';
    else return '有明月';
  };

  // 年間の経過を計算
  const getYearProgress = (date: Date) => {
    const year = date.getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    const now = date;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const percentage = (elapsed / total) * 100;
    const dayOfYear = Math.floor(elapsed / (1000 * 60 * 60 * 24)) + 1;
    const daysInYear = Math.floor(total / (1000 * 60 * 60 * 24));
    const daysRemaining = daysInYear - dayOfYear;
    
    return { percentage, dayOfYear, daysInYear, daysRemaining };
  };

  // 和暦を計算
  const getJapaneseEra = (date: Date) => {
    const year = date.getFullYear();
    if (year >= 2019) {
      return `令和${year - 2018}年`;
    } else if (year >= 1989) {
      return `平成${year - 1988}年`;
    }
    return '';
  };

  // 日付をフォーマット
  const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  };

  // 時刻の更新（毎秒）
  useEffect(() => {
    setCurrentTime(new Date());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!currentTime) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  // カレンダーの日付を生成
  const generateCalendarDays = (targetDate: Date) => {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: Date[] = [];
    const current = new Date(startDate);

    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current.getTime()));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const currentCalendarDays = generateCalendarDays(currentTime);
  const nextMonth = new Date(currentTime.getFullYear(), currentTime.getMonth() + 1, 1);
  const nextCalendarDays = generateCalendarDays(nextMonth);
  const today = currentTime.getDate();
  const currentMonth = currentTime.getMonth();
  const yearProgress = getYearProgress(currentTime);

  // カレンダーコンポーネント
  const CalendarGrid = ({ days, targetMonth, isMain = true }: { days: Date[], targetMonth: Date, isMain?: boolean }) => {
    const month = targetMonth.getMonth();
    const isCurrentMonth = currentTime.getMonth() === month && currentTime.getFullYear() === targetMonth.getFullYear();

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* 曜日ヘッダー */}
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`text-center font-semibold text-xs p-1 ${
              index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-400' : 'text-gray-300'
            }`}
          >
            {day}
          </div>
        ))}

        {/* 日付 */}
        {days.map((date, index) => {
          const isInMonth = date.getMonth() === month;
          const isToday = isCurrentMonth && isInMonth && date.getDate() === today;
          const dayOfWeek = date.getDay();
          const dateKey = formatDateKey(date);
          const holiday = holidays[dateKey];

          return (
            <div
              key={index}
              className={`
                relative flex items-center justify-center rounded font-medium
                transition-colors duration-150
                ${isMain ? 'h-10 text-base' : 'h-8 text-sm'}
                ${isInMonth ? '' : 'opacity-40'}
                ${isToday ? 'bg-blue-500 text-white' : 'hover:bg-slate-700/30'}
              `}
            >
              <span className={`
                ${!isInMonth ? 'text-gray-500' : 
                  isToday ? 'text-white font-bold' :
                  holiday ? 'text-red-400 font-bold' :
                  dayOfWeek === 0 ? 'text-red-300' : 
                  dayOfWeek === 6 ? 'text-blue-300' : 
                  'text-white'}
              `}>
                {date.getDate()}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-4">
      <div className="max-w-sm mx-auto">
        {/* 時計表示 */}
        <div className="text-center mb-6">
          <div className="text-5xl font-bold mb-3 font-mono tracking-wider">
            {currentTime.toLocaleTimeString('ja-JP', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            })}
          </div>
          <div className="text-base">
            <span className="text-blue-300">（{getJapaneseEra(currentTime)}）</span>
            {currentTime.getFullYear()}年{currentTime.getMonth() + 1}月{currentTime.getDate()}日
            <span className="ml-2 text-yellow-300">
              （{weekDays[currentTime.getDay()]}曜日）
            </span>
          </div>
        </div>

        {/* メインカレンダー */}
        <div className="bg-slate-800/80 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4" />
            <h2 className="text-lg font-bold">
              {currentTime.getFullYear()}年 {months[currentTime.getMonth()]}
            </h2>
          </div>

          <CalendarGrid days={currentCalendarDays} targetMonth={currentTime} isMain={true} />
        </div>

        {/* 追加情報パネル */}
        <div className="bg-slate-800/80 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-3 gap-3 text-sm">
            {/* 六曜 */}
            <div className="text-center">
              <div className="text-gray-400 text-xs mb-1">本日の六曜</div>
              <div className="text-base font-bold text-yellow-300">{getRokuyo(currentTime)}</div>
            </div>
            
            {/* 月齢 */}
            <div className="text-center">
              <div className="text-gray-400 text-xs mb-1 flex items-center justify-center gap-1">
                <Moon className="w-3 h-3" />
                月齢
              </div>
              <div className="text-base font-bold text-blue-300">{getMoonAge(currentTime)}</div>
            </div>
            
            {/* 年間進捗 */}
            <div className="text-center">
              <div className="text-gray-400 text-xs mb-1">今年の進捗</div>
              <div className="text-base font-bold text-green-300">{yearProgress.percentage.toFixed(1)}%</div>
              <div className="text-[10px] text-gray-400">残り{yearProgress.daysRemaining}日</div>
            </div>
          </div>
        </div>

        {/* 翌月カレンダー */}
        <div className="bg-slate-800/80 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4" />
            <h3 className="text-base font-semibold">
              {nextMonth.getFullYear()}年 {months[nextMonth.getMonth()]}
            </h3>
          </div>

          <CalendarGrid days={nextCalendarDays} targetMonth={nextMonth} isMain={false} />
        </div>
      </div>
    </div>
  );
};

export default DateTimeCalendarApp;
