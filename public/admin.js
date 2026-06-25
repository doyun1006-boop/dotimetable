const dialog = document.querySelector("#passwordDialog");
const passwordInput = document.querySelector("#passwordInput");
const unlockBtn = document.querySelector("#unlockBtn");
const academyNameInput = document.querySelector("#academyNameInput");
const heroTitleInput = document.querySelector("#heroTitleInput");
const heroDescriptionInput = document.querySelector("#heroDescriptionInput");
const noticeInput = document.querySelector("#noticeInput");
const openingLinkLabelInput = document.querySelector("#openingLinkLabelInput");
const openingLinkUrlInput = document.querySelector("#openingLinkUrlInput");
const gatheringLinkLabelInput = document.querySelector("#gatheringLinkLabelInput");
const gatheringLinkUrlInput = document.querySelector("#gatheringLinkUrlInput");
const counselLinkLabelInput = document.querySelector("#counselLinkLabelInput");
const counselLinkUrlInput = document.querySelector("#counselLinkUrlInput");
const addClassBtn = document.querySelector("#addClassBtn");
const saveBtn = document.querySelector("#saveBtn");
const list = document.querySelector("#classEditorList");
const classCount = document.querySelector("#classCount");
const adminMessage = document.querySelector("#adminMessage");
const adminCategoryTabs = document.querySelector("#adminCategoryTabs");

const days = ["월", "화", "수", "목", "금", "토", "일"];
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

let adminPassword = sessionStorage.getItem("academyAdminPassword") || "";
let activeCategory = sessionStorage.getItem("academyAdminCategory") || "basketball";
let lessons = [];

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function escapeAttr(value) {
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
    id: lesson.id || uid(),
    category: categoryIds.includes(lesson.category) ? lesson.category : "basketball",
    day: days.includes(lesson.day) ? lesson.day : "월",
    startTime: lesson.startTime || "15:00",
    endTime: lesson.endTime || "16:00",
    name: lesson.name || "",
    grade: lesson.grade || "",
    capacity: Number(lesson.capacity || 0),
    currentStudents: Number(lesson.currentStudents || 0),
    place: lesson.place || lesson.room || ""
  };
}

function newLesson() {
  return {
    id: uid(),
    category: activeCategory,
    day: "월",
    startTime: "15:00",
    endTime: "16:00",
    name: "",
    grade: "",
    capacity: 8,
    currentStudents: 0,
    place: ""
  };
}

function setMessage(text, isError = false) {
  adminMessage.textContent = text;
  adminMessage.style.color = isError ? "#ef4444" : "#16a34a";
}

function readRow(row) {
  return {
    id: row.dataset.id,
    category: row.querySelector("[data-field='category']").value,
    day: row.querySelector("[data-field='day']").value,
    startTime: row.querySelector("[data-field='startTime']").value,
    endTime: row.querySelector("[data-field='endTime']").value,
    name: row.querySelector("[data-field='name']").value.trim(),
    grade: row.querySelector("[data-field='grade']").value.trim(),
    capacity: Number(row.querySelector("[data-field='capacity']").value || 0),
    currentStudents: Number(row.querySelector("[data-field='currentStudents']").value || 0),
    place: row.querySelector("[data-field='place']").value.trim()
  };
}

function updateFromInputs() {
  const visibleRows = [...list.querySelectorAll(".class-row")];
  if (!visibleRows.length) return;

  const updatedById = new Map(visibleRows.map((row) => [row.dataset.id, normalizeLesson(readRow(row))]));
  lessons = lessons.map((lesson) => updatedById.get(lesson.id) || lesson);
}

function renderAdminTabs() {
  adminCategoryTabs.innerHTML = "";

  categories.forEach((category) => {
    const count = lessons.filter((lesson) => lesson.category === category.id).length;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tab-button ${activeCategory === category.id ? "active" : ""}`;
    button.dataset.category = category.id;
    button.innerHTML = `<span>${category.label}</span><strong>${count}</strong>`;
    adminCategoryTabs.append(button);
  });
}

function renderEditor() {
  list.innerHTML = "";
  renderAdminTabs();

  const filteredLessons = lessons
    .filter((lesson) => lesson.category === activeCategory)
    .sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day) || a.startTime.localeCompare(b.startTime));

  const activeLabel = categories.find((category) => category.id === activeCategory)?.label || "선택 탭";
  classCount.textContent = `${activeLabel} ${filteredLessons.length}개 / 전체 ${lessons.length}개`;

  if (!filteredLessons.length) {
    const empty = document.createElement("div");
    empty.className = "editor-empty";
    empty.textContent = `${activeLabel} 탭에 등록된 수업이 없습니다. 왼쪽의 수업 추가 버튼을 눌러주세요.`;
    list.append(empty);
    return;
  }

  filteredLessons.forEach((lesson) => {
    const row = document.createElement("div");
    row.className = "class-row";
    row.dataset.id = lesson.id || uid();
    row.innerHTML = `
      <label>종목
        <select data-field="category">
          ${categories.map((category) => `<option value="${category.id}" ${lesson.category === category.id ? "selected" : ""}>${category.label}</option>`).join("")}
        </select>
      </label>
      <label>요일
        <select data-field="day">
          ${days.map((day) => `<option value="${day}" ${lesson.day === day ? "selected" : ""}>${day}</option>`).join("")}
        </select>
      </label>
      <label>시작
        <input data-field="startTime" type="time" value="${escapeAttr(lesson.startTime)}" />
      </label>
      <label>종료
        <input data-field="endTime" type="time" value="${escapeAttr(lesson.endTime)}" />
      </label>
      <label>수업명
        <input data-field="name" type="text" value="${escapeAttr(lesson.name)}" placeholder="예: 초등 농구 기초반" />
      </label>
      <label>학년
        <input data-field="grade" type="text" value="${escapeAttr(lesson.grade)}" placeholder="예: 초1-3" />
      </label>
      <label>정원
        <input data-field="capacity" type="number" min="0" value="${Number(lesson.capacity || 0)}" />
      </label>
      <label>현재원
        <input data-field="currentStudents" type="number" min="0" value="${Number(lesson.currentStudents || 0)}" />
      </label>
      <label>장소
        <input data-field="place" type="text" value="${escapeAttr(lesson.place)}" placeholder="예: 1코트 / 풋살장 / 키즈룸" />
      </label>
      <div class="row-actions">
        <button type="button" class="danger" data-action="remove">삭제</button>
      </div>
    `;
    list.append(row);
  });
}

async function loadSchedule() {
  const response = await fetch("/.netlify/functions/schedule", { cache: "no-store" });
  if (!response.ok) throw new Error("시간표를 불러오지 못했습니다.");
  const data = await response.json();
  academyNameInput.value = data.academyName || defaults.academyName;
  heroTitleInput.value = data.heroTitle || defaults.heroTitle;
  heroDescriptionInput.value = data.heroDescription || defaults.heroDescription;
  noticeInput.value = data.notice || "";
  openingLinkLabelInput.value = data.openingLinkLabel || defaults.openingLinkLabel;
  openingLinkUrlInput.value = data.openingLinkUrl || defaults.openingLinkUrl;
  gatheringLinkLabelInput.value = data.gatheringLinkLabel || defaults.gatheringLinkLabel;
  gatheringLinkUrlInput.value = data.gatheringLinkUrl || defaults.gatheringLinkUrl;
  counselLinkLabelInput.value = data.counselLinkLabel || defaults.counselLinkLabel;
  counselLinkUrlInput.value = data.counselLinkUrl || defaults.counselLinkUrl;
  lessons = (data.lessons || []).map(normalizeLesson);
  renderEditor();
}

async function saveSchedule() {
  updateFromInputs();
  const payload = {
    academyName: academyNameInput.value.trim() || defaults.academyName,
    heroTitle: heroTitleInput.value.trim() || defaults.heroTitle,
    heroDescription: heroDescriptionInput.value.trim() || defaults.heroDescription,
    notice: noticeInput.value.trim(),
    openingLinkLabel: openingLinkLabelInput.value.trim() || defaults.openingLinkLabel,
    openingLinkUrl: openingLinkUrlInput.value.trim() || defaults.openingLinkUrl,
    gatheringLinkLabel: gatheringLinkLabelInput.value.trim() || defaults.gatheringLinkLabel,
    gatheringLinkUrl: gatheringLinkUrlInput.value.trim() || defaults.gatheringLinkUrl,
    counselLinkLabel: counselLinkLabelInput.value.trim() || defaults.counselLinkLabel,
    counselLinkUrl: counselLinkUrlInput.value.trim() || defaults.counselLinkUrl,
    lessons: lessons.map(normalizeLesson)
  };

  const response = await fetch("/.netlify/functions/schedule", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": adminPassword
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "저장에 실패했습니다.");
  }

  setMessage(`저장되었습니다. ${new Date().toLocaleTimeString("ko-KR")}`);
  renderEditor();
}

unlockBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  adminPassword = passwordInput.value;
  sessionStorage.setItem("academyAdminPassword", adminPassword);
  dialog.close();
  try {
    await loadSchedule();
    setMessage("관리자 화면이 준비되었습니다.");
  } catch (error) {
    setMessage(error.message, true);
  }
});

addClassBtn.addEventListener("click", () => {
  updateFromInputs();
  lessons.push(newLesson());
  renderEditor();
});

saveBtn.addEventListener("click", async () => {
  try {
    await saveSchedule();
  } catch (error) {
    setMessage(error.message, true);
  }
});

list.addEventListener("click", (event) => {
  if (event.target.dataset.action !== "remove") return;
  updateFromInputs();
  lessons = lessons.filter((lesson) => lesson.id !== event.target.closest(".class-row").dataset.id);
  renderEditor();
});

list.addEventListener("change", (event) => {
  if (event.target.dataset.field !== "category") return;
  updateFromInputs();
  renderEditor();
});

adminCategoryTabs.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;
  updateFromInputs();
  activeCategory = button.dataset.category;
  sessionStorage.setItem("academyAdminCategory", activeCategory);
  renderEditor();
});

if (!adminPassword) {
  dialog.showModal();
} else {
  loadSchedule().catch((error) => setMessage(error.message, true));
}
