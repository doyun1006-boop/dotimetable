const { getStore } = require("@netlify/blobs");
const { randomUUID } = require("crypto");

const allowedCategories = ["basketball", "soccer", "kids"];
const allowedDays = ["월", "화", "수", "목", "금", "토", "일"];

const defaults = {
  academyName: "DO SPORTS ACADEMY",
  heroTitle: "농구 · 축구 · 키즈 수업을 한눈에 보는 시간표",
  heroDescription: "수업 시간, 학년, 정원, 장소를 확인하시고 변경 사항은 최대 2초 안에 자동 반영됩니다.",
  notice: "시간표는 수시로 변경될 수 있습니다. 장소와 정원 현황을 꼭 확인해 주세요.",
  openingLinkLabel: "개설 희망",
  openingLinkUrl: "https://classroute-site.netlify.app/",
  gatheringLinkLabel: "반 모으기",
  gatheringLinkUrl: "https://classroute-site.netlify.app/",
  counselLinkLabel: "상담 및 신청서 작성",
  counselLinkUrl: "https://dosportslink.netlify.app/"
};

const seedSchedule = {
  ...defaults,
  lessons: [
    { id: "sample-basketball-1", category: "basketball", day: "월", startTime: "15:00", endTime: "16:00", name: "농구 기초반", grade: "초1-3", capacity: 10, currentStudents: 7, place: "1코트" },
    { id: "sample-basketball-2", category: "basketball", day: "수", startTime: "17:00", endTime: "18:20", name: "농구 스킬반", grade: "초4-6", capacity: 12, currentStudents: 10, place: "메인코트" },
    { id: "sample-basketball-3", category: "basketball", day: "금", startTime: "19:00", endTime: "20:30", name: "중등 농구반", grade: "중1-3", capacity: 12, currentStudents: 8, place: "메인코트" },
    { id: "sample-soccer-1", category: "soccer", day: "화", startTime: "16:00", endTime: "17:00", name: "축구 기초반", grade: "초1-2", capacity: 12, currentStudents: 9, place: "풋살장" },
    { id: "sample-soccer-2", category: "soccer", day: "목", startTime: "18:00", endTime: "19:20", name: "축구 게임반", grade: "초3-5", capacity: 14, currentStudents: 14, place: "풋살장" },
    { id: "sample-kids-1", category: "kids", day: "월", startTime: "16:20", endTime: "17:10", name: "키즈 체육", grade: "6-7세", capacity: 8, currentStudents: 5, place: "키즈룸" },
    { id: "sample-kids-2", category: "kids", day: "토", startTime: "11:00", endTime: "11:50", name: "유아 밸런스", grade: "5-7세", capacity: 8, currentStudents: 6, place: "키즈룸" }
  ]
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(body)
  };
}

function safeCategory(value) {
  return allowedCategories.includes(value) ? value : "basketball";
}

function safeDay(value) {
  return allowedDays.includes(value) ? value : "월";
}

function safeUrl(value, fallback) {
  const url = String(value || "").trim().slice(0, 250);
  return url.startsWith("https://") || url.startsWith("http://") ? url : fallback;
}

function safeNumber(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function sanitizeSchedule(input = {}) {
  return {
    academyName: String(input.academyName || defaults.academyName).slice(0, 80),
    heroTitle: String(input.heroTitle || defaults.heroTitle).slice(0, 120),
    heroDescription: String(input.heroDescription || defaults.heroDescription).slice(0, 300),
    notice: String(input.notice || "").slice(0, 500),
    openingLinkLabel: String(input.openingLinkLabel || defaults.openingLinkLabel).slice(0, 40),
    openingLinkUrl: safeUrl(input.openingLinkUrl, defaults.openingLinkUrl),
    gatheringLinkLabel: String(input.gatheringLinkLabel || defaults.gatheringLinkLabel).slice(0, 40),
    gatheringLinkUrl: safeUrl(input.gatheringLinkUrl, defaults.gatheringLinkUrl),
    counselLinkLabel: String(input.counselLinkLabel || defaults.counselLinkLabel).slice(0, 60),
    counselLinkUrl: safeUrl(input.counselLinkUrl, defaults.counselLinkUrl),
    lessons: Array.isArray(input.lessons)
      ? input.lessons.map((lesson) => ({
          id: String(lesson.id || randomUUID()).slice(0, 80),
          category: safeCategory(lesson.category),
          day: safeDay(lesson.day),
          startTime: String(lesson.startTime || "").slice(0, 5),
          endTime: String(lesson.endTime || "").slice(0, 5),
          name: String(lesson.name || "").slice(0, 80),
          grade: String(lesson.grade || "").slice(0, 40),
          capacity: safeNumber(lesson.capacity),
          currentStudents: safeNumber(lesson.currentStudents),
          place: String(lesson.place || lesson.room || "").slice(0, 50)
        }))
      : []
  };
}

function getScheduleStore() {
  return getStore("academy-schedule");
}

exports.handler = async (event) => {
  if (event.httpMethod === "GET") {
    try {
      const store = getScheduleStore();
      const saved = await store.get("current", { type: "json" });
      return json(200, saved ? sanitizeSchedule(saved) : seedSchedule);
    } catch (error) {
      return json(200, {
        ...seedSchedule,
        storageWarning: "Netlify Blobs 저장소 연결 전이라 기본 시간표를 표시합니다."
      });
    }
  }

  if (event.httpMethod === "POST") {
    const expectedPassword = process.env.ADMIN_PASSWORD;
    const providedPassword = event.headers["x-admin-password"];

    if (!expectedPassword) {
      return json(500, { message: "Netlify 환경변수 ADMIN_PASSWORD가 필요합니다." });
    }

    if (providedPassword !== expectedPassword) {
      return json(401, { message: "관리자 비밀번호가 올바르지 않습니다." });
    }

    let schedule;
    try {
      const parsed = JSON.parse(event.body || "{}");
      schedule = sanitizeSchedule(parsed);
    } catch (error) {
      return json(400, { message: `요청 데이터를 읽는 중 오류가 발생했습니다. (${error.message || error})` });
    }

    try {
      const store = getScheduleStore();
      await store.setJSON("current", schedule);
    } catch (error) {
      return json(500, {
        message: `시간표 저장 중 오류가 발생했습니다. Netlify Blobs 저장소에 쓰는 단계에서 실패했습니다. (${error.name || "Error"}: ${String(error.message || error).slice(0, 200)})`
      });
    }

    return json(200, schedule);
  }

  return json(405, { message: "허용되지 않는 요청입니다." });
};
