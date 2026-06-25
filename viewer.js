const board = document.querySelector("#scheduleBoard");
const emptyState = document.querySelector("#emptyState");
const notice = document.querySelector("#notice");
const connectionWarning = document.querySelector("#connectionWarning");
const academyName = document.querySelector("#academyName");
const heroTitle = document.querySelector("#heroTitle");
const heroDescription = document.querySelector("#heroDescription");
const openingLink = document.querySelector("#openingLink");
const gatheringLink = document.querySelector("#gatheringLink");
const counselLink = document.querySelector("#counselLink");
const lastUpdated = document.querySelector("#lastUpdated");
const liveDot = document.querySelector("#liveDot");
const categoryTabs = document.querySelector("#categoryTabs");

const dayOrder = ["월", "화", "수", "목", "금", "토", "일"];
const categories = [
  { id: "basketball", label: "농구" },
  { id: "soccer", label: "축구" },
  { id: "kids", label: "키즈" }
];

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

const fallbackSchedule = {
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

function getStorageItem(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch (error) {
    return fallback;
  }
}

function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // 저장소 접근이 제한된 환경에서는 탭 선택 저장을 생략합니다.
  }
}

let activeCategory = getStorageItem("academyActiveCategory", "basketball");
let latestData = null;
let usingFallback = false;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeLesson(lesson) {
  const categoryIds = categories.map((category) => category.id);
  return {
    ...lesson,
    category: categoryIds.includes(lesson.category) ? lesson.category : "basketball",
    place: lesson.place || lesson.room || ""
  };
}

function safeUrl(value, fallback) {
  const url = String(value || "").trim();
  return url.startsWith("https://") || url.startsWith("http://") ? url : fallback;
}

function updateLink(element, label, url, fallbackLabel, fallbackUrl) {
  element.textContent = label || fallbackLabel;
  element.href = safeUrl(url, fallbackUrl);
  element.hidden = false;
}

function byTime(a, b) {
  return a.startTime.localeCompare(b.startTime) || a.endTime.localeCompare(b.endTime);
}

function byDayAndTime(a, b) {
  const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
  return dayDiff || byTime(a, b);
}

function capacityClass(lesson) {
  const current = Number(lesson.currentStudents || 0);
  const limit = Number(lesson.capacity || 0);
  if (!limit) return "";
  return current >= limit ? "full" : "open";
}

function capacityText(lesson) {
  const current = Number(lesson.currentStudents || 0);
  const limit = Number(lesson.capacity || 0);
  if (!limit) return "정원 미정";
  return `${current}/${limit}명`;
}

function makeTimeSlots(lessons) {
  const slots = new Map();
  lessons.forEach((lesson) => {
    if (!lesson.startTime || !lesson.endTime) return;
    const key = `${lesson.startTime}-${lesson.endTime}`;
    slots.set(key, { startTime: lesson.startTime, endTime: lesson.endTime, key });
  });
  return [...slots.values()].sort(byTime);
}

function renderTabs(lessons) {
  categoryTabs.innerHTML = "";

  categories.forEach((category) => {
    const count = lessons.filter((lesson) => lesson.category === category.id).length;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tab-button ${activeCategory === category.id ? "active" : ""}`;
    button.dataset.category = category.id;
    button.innerHTML = `<span>${category.label}</span><strong>${count}</strong>`;
    categoryTabs.append(button);
  });
}

function renderLessonCard(lesson) {
  const card = document.createElement("div");
  card.className = "timetable-lesson";
  card.innerHTML = `
    <p class="lesson-name">${escapeHtml(lesson.name || "수업명 미입력")}</p>
    <div class="lesson-meta compact">
      <span class="pill">${escapeHtml(lesson.grade || "학년 미정")}</span>
      <span class="pill capacity ${capacityClass(lesson)}">${escapeHtml(capacityText(lesson))}</span>
      ${lesson.place ? `<span class="pill place">📍 ${escapeHtml(lesson.place)}</span>` : ""}
    </div>
  `;
  return card;
}

function renderTimetable(lessons) {
  const filteredLessons = lessons.filter((lesson) => lesson.category === activeCategory).sort(byDayAndTime);
  const slots = makeTimeSlots(filteredLessons);
  board.innerHTML = "";

  if (!filteredLessons.length || !slots.length) {
    emptyState.hidden = false;
    emptyState.textContent = `${categories.find((category) => category.id === activeCategory)?.label || "선택한 탭"} 시간표에 등록된 수업이 없습니다.`;
    return;
  }

  emptyState.hidden = true;

  const scroller = document.createElement("div");
  scroller.className = "timetable-scroller";

  const table = document.createElement("table");
  table.className = "timetable";
  table.innerHTML = `
    <thead>
      <tr>
        <th scope="col" class="time-head">시간</th>
        ${dayOrder.map((day) => `<th scope="col">${day}요일</th>`).join("")}
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  slots.forEach((slot) => {
    const row = document.createElement("tr");
    const timeCell = document.createElement("th");
    timeCell.scope = "row";
    timeCell.className = "time-cell";
    timeCell.innerHTML = `<strong>${escapeHtml(slot.startTime)}</strong><span>${escapeHtml(slot.endTime)}</span>`;
    row.append(timeCell);

    dayOrder.forEach((day) => {
      const cell = document.createElement("td");
      const cellLessons = filteredLessons.filter(
        (lesson) => lesson.day === day && lesson.startTime === slot.startTime && lesson.endTime === slot.endTime
      );

      if (!cellLessons.length) {
        cell.className = "empty-cell";
        cell.textContent = "-";
      } else {
        const stack = document.createElement("div");
        stack.className = "cell-stack";
        cellLessons.forEach((lesson) => stack.append(renderLessonCard(lesson)));
        cell.append(stack);
      }

      row.append(cell);
    });

    tbody.append(row);
  });

  scroller.append(table);
  board.append(scroller);
}

function render(data) {
  academyName.textContent = data.academyName || defaults.academyName;
  heroTitle.textContent = data.heroTitle || defaults.heroTitle;
  heroDescription.textContent = data.heroDescription || defaults.heroDescription;
  notice.hidden = !data.notice;
  notice.textContent = data.notice || "";

  updateLink(openingLink, data.openingLinkLabel, data.openingLinkUrl, defaults.openingLinkLabel, defaults.openingLinkUrl);
  updateLink(gatheringLink, data.gatheringLinkLabel, data.gatheringLinkUrl, defaults.gatheringLinkLabel, defaults.gatheringLinkUrl);
  updateLink(counselLink, data.counselLinkLabel, data.counselLinkUrl, defaults.counselLinkLabel, defaults.counselLinkUrl);

  const lessons = [...(data.lessons || [])].map(normalizeLesson).sort(byDayAndTime);
  renderTabs(lessons);
  renderTimetable(lessons);
}

async function loadSchedule() {
  try {
    const response = await fetch("/.netlify/functions/schedule", { cache: "no-store" });
    if (!response.ok) throw new Error(`시간표 API 오류 ${response.status}`);
    latestData = await response.json();
    usingFallback = false;
    render(latestData);
    liveDot.classList.remove("offline");
    connectionWarning.hidden = true;
    lastUpdated.textContent = `방금 업데이트됨 ${new Date().toLocaleTimeString("ko-KR")}`;
  } catch (error) {
    liveDot.classList.add("offline");
    lastUpdated.textContent = "연결 재시도 중";

    if (!latestData) {
      usingFallback = true;
      latestData = fallbackSchedule;
      render(fallbackSchedule);
      connectionWarning.hidden = false;
      connectionWarning.textContent = "현재 시간표 저장 서버와 연결되지 않아 예시 시간표를 표시하고 있습니다. 관리자 저장 기능을 사용하려면 Netlify Functions 배포 상태를 확인해 주세요.";
    }
  }
}

categoryTabs.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  setStorageItem("academyActiveCategory", activeCategory);
  if (latestData) render(latestData);
});

loadSchedule();
setInterval(loadSchedule, 2000);
