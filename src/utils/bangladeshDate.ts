/**
 * Dynamic Bangladesh Date & Revised Bangla Calendar Utility
 * Always computes date in official Asia/Dhaka timezone (UTC+6).
 *
 * Output format example for 2026-11-22 (Sunday):
 * "আজ ২২ নভেম্বর ২০২৬, রোজ রবিবার (৭ অগ্রহায়ণ ১৪৩৩ বঙ্গাব্দ)।"
 */

const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

const GREGORIAN_MONTHS_BN = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

const WEEKDAYS_BN = [
  'রবিবার',
  'সোমবার',
  'মঙ্গলবার',
  'বুধবার',
  'বৃহস্পতিবার',
  'শুক্রবার',
  'শনিবার',
];

export function toBanglaDigits(value: number | string): string {
  return String(value).replace(/\d/g, d => BANGLA_DIGITS[Number(d)] ?? d);
}

function isGregorianLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Extracts calendar components { year, month (1..12), day (1..31), weekday (0=Sun..6=Sat) }
 * strictly in the Asia/Dhaka timezone.
 */
export function getDhakaCalendarParts(date: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  weekday: number;
} {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  });
  const parts = formatter.formatToParts(date);
  let year = 2026;
  let month = 1;
  let day = 1;
  let weekday = 0;

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  for (const p of parts) {
    if (p.type === 'year') year = Number(p.value);
    else if (p.type === 'month') month = Number(p.value);
    else if (p.type === 'day') day = Number(p.value);
    else if (p.type === 'weekday' && p.value in weekdayMap) weekday = weekdayMap[p.value];
  }

  return { year, month, day, weekday };
}

/**
 * Official Revised Bangladesh (Bangla Academy) Calendar calculation.
 * Verified dates:
 * - Boishakh 1 = April 14
 * - Boishakh..Ashwin = 31 days each (Apr 14, May 15, Jun 15, Jul 16, Aug 16, Sep 16)
 * - Kartik..Chaitra = 30 days each except Falgun (29 days in common year, 30 days in leap year)
 * - Kartik 1 = Oct 17, Agrahayan 1 = Nov 16, Poush 1 = Dec 16,
 *   Magh 1 = Jan 15, Falgun 1 = Feb 14, Chaitra 1 = Mar 15
 */
export function getBangladeshBanglaDate(year: number, month: number, day: number): {
  day: number;
  monthName: string;
  year: number;
} {
  // Bangla year starts on April 14
  const isBeforePohelaBoishakh = month < 4 || (month === 4 && day < 14);
  const banglaYear = isBeforePohelaBoishakh ? year - 594 : year - 593;

  // Approximate Gregorian-to-Bangla month boundaries (Official 2019 Bangla Academy Revision)
  if ((month === 4 && day >= 14) || (month === 5 && day <= 14)) {
    return {
      day: month === 4 ? day - 13 : 17 + day,
      monthName: 'বৈশাখ',
      year: banglaYear,
    };
  }
  if ((month === 5 && day >= 15) || (month === 6 && day <= 14)) {
    return {
      day: month === 5 ? day - 14 : 17 + day,
      monthName: 'জ্যৈষ্ঠ',
      year: banglaYear,
    };
  }
  if ((month === 6 && day >= 15) || (month === 7 && day <= 15)) {
    return {
      day: month === 6 ? day - 14 : 16 + day,
      monthName: 'আষাঢ়',
      year: banglaYear,
    };
  }
  if ((month === 7 && day >= 16) || (month === 8 && day <= 15)) {
    return {
      day: month === 7 ? day - 15 : 16 + day,
      monthName: 'শ্রাবণ',
      year: banglaYear,
    };
  }
  if ((month === 8 && day >= 16) || (month === 9 && day <= 15)) {
    return {
      day: month === 8 ? day - 15 : 16 + day,
      monthName: 'ভাদ্র',
      year: banglaYear,
    };
  }
  if ((month === 9 && day >= 16) || (month === 10 && day <= 16)) {
    return {
      day: month === 9 ? day - 15 : 15 + day,
      monthName: 'আশ্বিন',
      year: banglaYear,
    };
  }
  if ((month === 10 && day >= 17) || (month === 11 && day <= 15)) {
    return {
      day: month === 10 ? day - 16 : 15 + day,
      monthName: 'কার্তিক',
      year: banglaYear,
    };
  }
  if ((month === 11 && day >= 16) || (month === 12 && day <= 15)) {
    return {
      day: month === 11 ? day - 15 : 15 + day,
      monthName: 'অগ্রহায়ণ',
      year: banglaYear,
    };
  }
  if ((month === 12 && day >= 16) || (month === 1 && day <= 14)) {
    return {
      day: month === 12 ? day - 15 : 16 + day,
      monthName: 'পৌষ',
      year: banglaYear,
    };
  }
  if ((month === 1 && day >= 15) || (month === 2 && day <= 13)) {
    return {
      day: month === 1 ? day - 14 : 17 + day,
      monthName: 'মাঘ',
      year: banglaYear,
    };
  }
  const falgunEndDay = isGregorianLeapYear(year) ? 15 : 14;
  if ((month === 2 && day >= 14) || (month === 3 && day <= falgunEndDay)) {
    return {
      day: month === 2 ? day - 13 : (isGregorianLeapYear(year) ? 16 : 15) + day,
      monthName: 'ফাল্গুন',
      year: banglaYear,
    };
  }

  // Chaitra: starts March (falgunEndDay + 1) until April 13
  return {
    day: month === 3 ? day - falgunEndDay : (31 - falgunEndDay) + day,
    monthName: 'চৈত্র',
    year: banglaYear,
  };
}

/**
 * Formats the complete dynamic Bangladesh greeting date string:
 * e.g., "আজ ২২ নভেম্বর ২০২৬, রোজ রবিবার (৭ অগ্রহায়ণ ১৪৩৩ বঙ্গাব্দ)।"
 */
export function formatDynamicBangladeshDateGreeting(date: Date = new Date()): string {
  const { year, month, day, weekday } = getDhakaCalendarParts(date);
  const banglaDate = getBangladeshBanglaDate(year, month, day);

  const bnDay = toBanglaDigits(day);
  const bnMonth = GREGORIAN_MONTHS_BN[month - 1] || GREGORIAN_MONTHS_BN[0];
  const bnYear = toBanglaDigits(year);
  const bnWeekday = WEEKDAYS_BN[weekday] || WEEKDAYS_BN[0];

  const banglaCalDay = toBanglaDigits(banglaDate.day);
  const banglaCalYear = toBanglaDigits(banglaDate.year);

  return `আজ ${bnDay} ${bnMonth} ${bnYear}, রোজ ${bnWeekday} (${banglaCalDay} ${banglaDate.monthName} ${banglaCalYear} বঙ্গাব্দ)।`;
}
