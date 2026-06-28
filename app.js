const students = [];

const defaultAvatarBaseIds = [
  "boy",
  "girl",
  "boy",
  "girl",
  "boy",
  "girl",
  "boy",
  "girl",
  "boy",
  "girl",
  "boy",
  "girl",
  "boy",
  "girl",
  "boy",
];

const avatarBases = [
  {
    id: "boy",
    name: "남학생 기본",
    min: 0,
    desc: "남학생 기본 아바타",
    asset: "base-boy",
  },
  {
    id: "girl",
    name: "여학생 기본",
    min: 0,
    desc: "여학생 기본 아바타",
    asset: "base-girl",
  },
];

const avatarClothing = [
  { id: "basic", name: "기본", min: 0, desc: "처음부터 선택 가능", asset: null },
  { id: "summer-shirt", name: "하복셔츠", min: 50, desc: "50P부터 해제", asset: "summer-shirt" },
  { id: "summer-pe", name: "하복체육복", min: 80, desc: "80P부터 해제", asset: "summer-pe" },
  { id: "summer-daily", name: "하복생활복", min: 110, desc: "110P부터 해제", asset: "summer-daily" },
  { id: "spring-fall", name: "춘추복", min: 140, desc: "140P부터 해제", asset: "spring-fall" },
  { id: "cardigan", name: "가디건", min: 170, desc: "170P부터 해제", asset: "cardigan" },
  { id: "winter", name: "동복", min: 200, desc: "200P부터 해제", asset: "winter" },
  { id: "winter-pe", name: "동복체육복", min: 230, desc: "230P부터 해제", asset: "winter-pe" },
  { id: "class-tee", name: "반티", min: 260, desc: "260P부터 해제", asset: "class-tee" },
];

const avatarBackgrounds = [
  { id: "basic-bg", name: "기본 배경", min: 0, desc: "처음부터 선택 가능", asset: null },
  { id: "classroom", name: "교실 배경", min: 40, desc: "40P부터 해제", asset: "classroom" },
  { id: "school-summer", name: "여름학교 배경", min: 70, desc: "70P부터 해제", asset: "school_summer" },
  { id: "library", name: "도서관 배경", min: 100, desc: "100P부터 해제", asset: "library" },
  { id: "school-fall", name: "가을학교 배경", min: 130, desc: "130P부터 해제", asset: "school_fall" },
  { id: "night", name: "별밤 배경", min: 160, desc: "160P부터 해제", asset: "night" },
  { id: "school-winter", name: "겨울학교 배경", min: 190, desc: "190P부터 해제", asset: "school_winter" },
  { id: "school-spring", name: "봄학교 배경", min: 220, desc: "220P부터 해제", asset: "school_spring" },
];

const imageAssetVersion = "21";
const avatarStorageKey = "classroomHqAvatarChoices";
const profileStorageKey = "classroomHqStudentProfiles";
const sessionStorageKey = "classroomHqSavedSession";
const sessionPayloadStorageKey = "classroomHqCachedSessionPayloads";
const API_URL = "https://script.google.com/macros/s/AKfycbw0S2YHTyVvmOqAvij_KNZ_XjcqMiXuJ7pA_r5aTfGZYH6HxLk_D52qADRCJwSKMfs/exec";
const studentListLoadingText = "\uBA85\uB2E8\uC744 \uBD88\uB7EC\uC624\uB294 \uC911...";
const studentListErrorText = "\uBA85\uB2E8\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4";
const savedAvatarChoices = loadAvatarChoices();
const savedStudentProfiles = loadStudentProfiles();

students.forEach((student, index) => {
  const saved = savedAvatarChoices[index];
  const savedProfile = savedStudentProfiles[index];
  student.title = savedProfile?.title || student.title;
  student.avatar = {
    base: normalizeBase(saved?.base, index),
    clothing: normalizeClothing(saved?.clothing || migrateClothing(saved?.upgrade)),
    background: normalizeBackground(saved?.background),
  };
});

let state = {
  role: "student",
  activeStudent: 0,
  activeTab: "home",
  noticeFilter: "all",
  apiToken: "",
  apiStudentId: "",
  apiReady: false,
  studentListStatus: "loading",
  notices: [],
  history: [],
  pointLogs: [],
  polls: [],
  classGoal: null,
  gallery: null,
  galleryStatus: "idle",
  galleryError: "",
  galleryActiveAlbumId: "",
};

const app = document.querySelector("#app");
const loginPanel = document.querySelector(".login-panel");
const toast = document.querySelector("#toast");
const networkLock = document.querySelector("#networkLock");
let isOfflineLocked = false;

const labels = {
  school: "학교",
  class: "우리반",
  private: "개인",
};

function migrateClothing(oldUpgrade) {
  return oldUpgrade === "jacket" ? "spring-fall" : "basic";
}

function normalizeBase(baseId, index) {
  if (avatarBases.some((item) => item.id === baseId)) return baseId;
  return defaultAvatarBaseIds[index] || "boy";
}

function normalizeClothing(clothingId) {
  const migration = {
    coral: "summer-shirt",
    navy: "spring-fall",
    gold: "cardigan",
  };
  const nextId = migration[clothingId] || clothingId || "basic";
  return avatarClothing.some((item) => item.id === nextId) ? nextId : "basic";
}

function normalizeBackground(backgroundId) {
  const nextId = backgroundId || "basic-bg";
  return avatarBackgrounds.some((item) => item.id === nextId) ? nextId : "basic-bg";
}

function loadAvatarChoices() {
  try {
    return JSON.parse(localStorage.getItem(avatarStorageKey) || "{}");
  } catch {
    return {};
  }
}

function saveAvatarChoices() {
  const choices = {};
  students.forEach((student, index) => {
    choices[index] = student.avatar;
  });
  localStorage.setItem(avatarStorageKey, JSON.stringify(choices));
}

function loadStudentProfiles() {
  try {
    return JSON.parse(localStorage.getItem(profileStorageKey) || "{}");
  } catch {
    return {};
  }
}

function saveStudentProfiles() {
  const profiles = {};
  students.forEach((student, index) => {
    profiles[index] = { title: student.title };
  });
  localStorage.setItem(profileStorageKey, JSON.stringify(profiles));
}

function loadSavedSession() {
  try {
    return JSON.parse(localStorage.getItem(sessionStorageKey) || "null");
  } catch {
    return null;
  }
}

function saveSession(role, token, studentId = "") {
  if (!token) return;
  try {
    localStorage.setItem(
      sessionStorageKey,
      JSON.stringify({
        role,
        token,
        studentId,
        savedAt: new Date().toISOString(),
      }),
    );
  } catch {
    showToast("이 기기에서 로그인 유지 정보를 저장하지 못했습니다.");
  }
}

function clearSavedSession() {
  try {
    localStorage.removeItem(sessionStorageKey);
    localStorage.removeItem(sessionPayloadStorageKey);
  } catch {
    // 저장소 접근이 막힌 환경이면 앱 상태만 정리합니다.
  }
}

function sessionPayloadKey(role, studentId = "") {
  return role === "teacher" ? "teacher" : `student:${studentId || "unknown"}`;
}

function loadSessionPayloads() {
  try {
    return JSON.parse(localStorage.getItem(sessionPayloadStorageKey) || "{}");
  } catch {
    return {};
  }
}

function loadSessionPayload(role, studentId = "") {
  const payloads = loadSessionPayloads();
  return payloads[sessionPayloadKey(role, studentId)]?.payload || null;
}

function saveSessionPayload(role, studentId, payload) {
  if (!payload) return;
  try {
    const payloads = loadSessionPayloads();
    payloads[sessionPayloadKey(role, studentId)] = {
      payload,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(sessionPayloadStorageKey, JSON.stringify(payloads));
  } catch {
    // 화면 캐시는 속도 보조 기능이라 실패해도 앱 사용은 계속됩니다.
  }
}

function qs(selector) {
  return document.querySelector(selector);
}

function qsa(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
}

function isSessionError(error) {
  const message = String(error?.message || "");
  return /session|token|expired|forbidden|auth_required|로그인|만료/i.test(message);
}

async function apiRequest(action, payload = {}) {
  if (navigator.onLine === false) {
    syncNetworkLock();
    throw new Error("인터넷 연결이 필요합니다.");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...payload }),
  });
  const result = await response.json();
  if (!result.ok) {
    throw new Error(result.error?.message || "구글 시트 요청에 실패했습니다.");
  }
  return result.data;
}

function apiStudentToLocal(student, fallbackIndex = 0) {
  return {
    studentId: student.studentId,
    number: student.number || fallbackIndex + 1,
    name: student.name || `Student ${fallbackIndex + 1}`,
    password: "",
    points: Number(student.points || 0),
    rank: Number(student.rank || fallbackIndex + 1),
    level: student.level || "Lv.1",
    title: student.title || "",
    avatar: {
      base: normalizeBase(student.avatar?.baseId, fallbackIndex),
      clothing: normalizeClothing(student.avatar?.clothingItemId),
      background: normalizeBackground(student.avatar?.backgroundItemId),
    },
  };
}

function replaceStudentsFromApi(apiStudents = []) {
  if (!apiStudents.length) {
    students.splice(0, students.length);
    state.studentListStatus = "empty";
    renderStudentSelect();
    renderAdminSelects();
    return;
  }

  const mapped = apiStudents
    .map((student, index) => apiStudentToLocal(student, index))
    .sort((a, b) => Number(a.number || 0) - Number(b.number || 0));
  students.splice(0, students.length, ...mapped);
  state.studentListStatus = "ready";
  state.activeStudent = Math.max(0, Math.min(state.activeStudent, students.length - 1));
  renderStudentSelect();
  renderAdminSelects();
}

function studentIndexById(studentId) {
  return students.findIndex((student) => student.studentId === studentId);
}

function noticeFromApi(notice) {
  const targetIndex = notice.targetStudentId ? studentIndexById(notice.targetStudentId) : null;
  return {
    noticeId: notice.noticeId,
    scope: notice.scope || "class",
    title: notice.title || "",
    body: notice.body || "",
    time: notice.publishAt || "",
    target: targetIndex,
    targetStudentId: notice.targetStudentId || "",
    targetName: notice.targetStudentName || (targetIndex !== null && targetIndex >= 0 ? students[targetIndex]?.name : ""),
    unread: true,
  };
}

function pollFromApi(survey) {
  if (survey.type === "text") {
    const responses = [];
    if (survey.textResponse) {
      responses.push({ student: state.activeStudent, text: survey.textResponse });
    }
    if (Array.isArray(survey.responses)) {
      survey.responses.forEach((response) => {
        const index = studentIndexById(response.studentId);
        responses.push({
          student: index >= 0 ? index : 0,
          text: response.textResponse || "",
        });
      });
    }
    return {
      id: survey.surveyId,
      type: "text",
      question: survey.question || "",
      closes: survey.closesAt || "진행 중",
      status: survey.status || "",
      responseCount: Number(survey.responseCount || responses.length || 0),
      responses: responses.map((response, index) => ({
        ...response,
        studentName: survey.responses?.[index]?.studentName || students[response.student]?.name || "",
        updatedAt: survey.responses?.[index]?.updatedAt || "",
      })),
    };
  }

  const options = (survey.options || []).map((option) => ({
    optionId: option.optionId,
    text: option.optionText || "",
    count: Number(option.count || 0),
  }));
  const selected = options.findIndex((option) => option.optionId === survey.selectedOptionId);
  return {
    id: survey.surveyId,
    type: "choice",
    question: survey.question || "",
    closes: survey.closesAt || "진행 중",
    status: survey.status || "",
    responseCount: Number(survey.responseCount || 0),
    allowEdit: survey.allowEdit !== false,
    options,
    selected: selected >= 0 ? selected : null,
    isSubmitting: false,
  };
}

function formatPointDelta(amount) {
  const value = Number(amount || 0);
  return `${value > 0 ? "+" : ""}${value}P`;
}

function todayDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function comparePointLogDesc(a, b) {
  const byDate = String(b?.date || "").localeCompare(String(a?.date || ""));
  if (byDate) return byDate;
  return Number(b?.rowNumber || 0) - Number(a?.rowNumber || 0);
}

function pollParticipationCount(poll) {
  if (!poll) return 0;
  if (Number.isFinite(Number(poll.responseCount)) && Number(poll.responseCount) > 0) {
    return Number(poll.responseCount);
  }
  if (poll.type === "text") return poll.responses.length;
  return poll.options.reduce((sum, option) => sum + Number(option.count || 0), 0);
}

function pollParticipationLabel(poll) {
  return `${pollParticipationCount(poll)}${poll?.type === "text" ? "건" : "명"}`;
}

function pointLogFromApi(entry) {
  return {
    rowNumber: Number(entry.rowNumber || 0),
    studentId: entry.studentId || "",
    reason: entry.reason || "",
    amount: Number(entry.pointsDelta || 0),
    date: entry.createdAt || "",
  };
}

function galleryFromApi(gallery) {
  return {
    warning:
      gallery?.warning ||
      "이 갤러리의 사진은 동명중 1-1 학급 구성원만 보기 위한 자료입니다. 사진을 저장, 캡처, 외부 공유하지 말아 주세요.",
    rootFolderName: gallery?.rootFolderName || "우리반 갤러리",
    updatedAt: gallery?.updatedAt || "",
    albums: (gallery?.albums || []).map((album) => ({
      id: album.albumId || "",
      title: album.title || "앨범",
      photoCount: Number(album.photoCount || album.photos?.length || 0),
      coverUrl: album.coverUrl || "",
      photos: (album.photos || []).map((photo) => ({
        id: photo.photoId || "",
        title: photo.title || "사진",
        thumbnailUrl: photo.thumbnailUrl || "",
        imageUrl: photo.imageUrl || photo.thumbnailUrl || "",
        createdAt: photo.createdAt || "",
      })),
    })),
  };
}

function classGoalFromApi(goal) {
  if (!goal) return null;

  const targetPoints = Number(goal.targetPoints || 0);
  const currentPoints = Number(goal.currentPoints || 0);
  if (!targetPoints && !goal.title) return null;

  return {
    goalId: goal.goalId || "G001",
    title: goal.title || "학급 공동 목표",
    targetPoints,
    currentPoints,
    progress: Number(goal.progress || (targetPoints ? Math.round((currentPoints / targetPoints) * 100) : 0)),
    remainingPoints: Number(goal.remainingPoints || Math.max(targetPoints - currentPoints, 0)),
    rewardName: goal.rewardName || "",
    status: goal.status || "open",
    active: goal.active !== false,
  };
}

function applyStudentPayload(home) {
  if (!home) return;

  if (Array.isArray(home.leaderboard) && home.leaderboard.length) {
    replaceStudentsFromApi(home.leaderboard);
  } else if (home.student) {
    replaceStudentsFromApi([home.student]);
  }

  const activeIndex = studentIndexById(home.student?.studentId || state.apiStudentId);
  if (activeIndex >= 0) {
    state.activeStudent = activeIndex;
    state.apiStudentId = students[activeIndex].studentId || state.apiStudentId;
  }

  if (Array.isArray(home.notices)) {
    state.notices = home.notices.map(noticeFromApi);
  }
  if (Array.isArray(home.pointHistory)) {
    state.history = home.pointHistory.map((entry) => ({
      reason: entry.reason || "",
      amount: Number(entry.pointsDelta || 0),
      date: entry.createdAt || "",
    }));
  }
  if (Array.isArray(home.surveys)) {
    state.polls = home.surveys.map(pollFromApi);
  }
  if (Object.prototype.hasOwnProperty.call(home, "classGoal")) {
    state.classGoal = classGoalFromApi(home.classGoal);
  }

  state.apiReady = true;
  if (state.apiToken) {
    saveSessionPayload("student", state.apiStudentId || home.student?.studentId || "", home);
  }
}

function applyTeacherPayload(dashboard) {
  if (!dashboard) return;

  if (Array.isArray(dashboard.students)) {
    replaceStudentsFromApi(dashboard.students);
  }
  if (Array.isArray(dashboard.notices)) {
    state.notices = dashboard.notices.map(noticeFromApi);
  }
  if (Array.isArray(dashboard.surveys)) {
    state.polls = dashboard.surveys.map(pollFromApi);
  }
  if (Array.isArray(dashboard.pointLogs)) {
    state.pointLogs = dashboard.pointLogs.map(pointLogFromApi).sort(comparePointLogDesc);
  }
  if (Object.prototype.hasOwnProperty.call(dashboard, "classGoal")) {
    state.classGoal = classGoalFromApi(dashboard.classGoal);
    syncClassGoalFields();
  }
  state.apiReady = true;
  if (state.apiToken) {
    saveSessionPayload("teacher", "", dashboard);
  }
}

async function loadPublicData() {
  try {
    const data = await apiRequest("getPublicData");
    replaceStudentsFromApi(data.students || []);
    if (Object.prototype.hasOwnProperty.call(data, "classGoal")) {
      state.classGoal = classGoalFromApi(data.classGoal);
    }
    if (students.length) {
      renderAll();
    }
  } catch (error) {
    state.studentListStatus = "error";
    renderStudentSelect();
    showToast("구글 시트 연결을 확인해 주세요.");
  }
}

async function restoreSavedSession() {
  const saved = loadSavedSession();
  if (!saved?.token || !["student", "teacher"].includes(saved.role)) {
    return false;
  }

  let usedCachedPayload = false;
  const cachedPayload = loadSessionPayload(saved.role, saved.studentId || "");
  state.role = saved.role;
  state.apiToken = saved.token;
  state.apiStudentId = saved.studentId || "";

  if (cachedPayload) {
    if (saved.role === "teacher") {
      applyTeacherPayload(cachedPayload);
    } else {
      applyStudentPayload(cachedPayload);
    }
    setLoginRole(saved.role);
    setScreen("main");
    setTab("home");
    renderAll();
    usedCachedPayload = true;
  }

  try {
    if (saved.role === "teacher") {
      const dashboard = await apiRequest("getTeacherDashboard", { token: saved.token });
      applyTeacherPayload(dashboard);
    } else {
      const home = await apiRequest("getStudentHome", { token: saved.token });
      state.apiStudentId = home.student?.studentId || saved.studentId || "";
      applyStudentPayload(home);
    }

    setLoginRole(saved.role);
    setScreen("main");
    setTab("home");
    renderAll();
    return true;
  } catch (error) {
    if (usedCachedPayload && !isSessionError(error)) {
      showToast("저장된 화면을 먼저 보여주고 있어요. 최신 데이터 갱신은 다시 시도됩니다.");
      return true;
    }

    clearSavedSession();
    state.apiToken = "";
    state.apiStudentId = "";
    setScreen("login");
    showToast("로그인 정보가 만료되어 다시 로그인해 주세요.");
    return false;
  }
}

function setOfflineLock(shouldLock) {
  isOfflineLocked = shouldLock;
  app.classList.toggle("is-offline", shouldLock);
  networkLock.setAttribute("aria-hidden", shouldLock ? "false" : "true");
  qsa(".screen").forEach((screen) => {
    screen.inert = shouldLock;
  });

  if (shouldLock) {
    try {
      networkLock.focus({ preventScroll: true });
    } catch {
      networkLock.focus();
    }
  }
}

function syncNetworkLock() {
  const shouldLock = navigator.onLine === false;
  const wasLocked = isOfflineLocked;
  setOfflineLock(shouldLock);

  if (wasLocked && !shouldLock) {
    showToast("네트워크가 다시 연결되었습니다.");
  }
}

function blockWhenOffline(event) {
  if (!isOfflineLocked) return;
  if (networkLock.contains(event.target)) return;

  event.preventDefault();
  event.stopImmediatePropagation();
}

function installNetworkLock() {
  ["click", "submit", "keydown", "input", "change", "pointerdown", "touchstart"].forEach((eventName) => {
    document.addEventListener(eventName, blockWhenOffline, true);
  });
  window.addEventListener("online", syncNetworkLock);
  window.addEventListener("offline", syncNetworkLock);
  syncNetworkLock();
}

function setScreen(screenName) {
  qsa(".screen").forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === screenName);
  });
}

function setLoginRole(role) {
  state.role = role;
  qsa("[data-login-role]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.loginRole === role);
  });
  loginPanel.classList.toggle("teacher-login", role === "teacher");
  syncLoginButtonState();
}

function setTab(tab) {
  state.activeTab = tab;
  qsa(".tab-view").forEach((view) => {
    view.classList.toggle("is-active", view.dataset.tab === tab);
  });
  qsa("[data-tab-target]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tabTarget === tab);
  });
  qs("#headerTitle").textContent =
    {
      home: "홈",
      notices: "공지",
      points: "포인트",
      avatar: "꾸미기",
      polls: "설문",
      gallery: "갤러리",
      admin: "관리",
    }[tab] || "홈";
  if (tab === "gallery") {
    renderGallery();
    maybeLoadGallery();
  }
}

function visibleNotices() {
  return state.notices.filter((notice) => {
    const studentCanSee = notice.scope !== "private" || notice.target === state.activeStudent;
    const teacherCanSee = state.role === "teacher";
    const scopeMatches = state.noticeFilter === "all" || notice.scope === state.noticeFilter;
    return (teacherCanSee || studentCanSee) && scopeMatches;
  });
}

function renderHome() {
  const student = students[state.activeStudent];
  if (state.role === "teacher") {
    renderTeacherHome();
    return;
  }

  qs("#studentName").textContent = student.name;
  qs("#homePoints").textContent = student.points;
  qs("#pointsTotal").textContent = student.points;
  qs("#levelText").textContent = student.level;
  qs("#levelName").textContent = student.title;
  qs("#homeRank").textContent = student.rank ? `${student.rank}위` : "-";
  qs("#homeLevelSummary").textContent = student.level || "Lv.1";
  renderAvatar("#homeAvatar", student);

  const latestPoint = state.history[0];
  qs("#homePointSummary").textContent = latestPoint
    ? `${formatPointDelta(latestPoint.amount)} · ${latestPoint.reason}`
    : "포인트 기록 없음";

  const unread = state.notices.filter((notice) => {
    return notice.unread && (notice.scope !== "private" || notice.target === state.activeStudent);
  });
  qs("#unreadCount").textContent = unread.length;

  const homeNoticeList = qs("#homeNoticeList");
  homeNoticeList.innerHTML = "";
  visibleNotices()
    .slice(0, 3)
    .forEach((notice) => {
      homeNoticeList.appendChild(createNoticeItem(notice));
    });

  renderHomePollPreview();
  renderClassGoal();
}

function renderTeacherHome() {
  const totalStudents = students.length;
  const todayKey = todayDateKey();
  const todayPoints = state.pointLogs
    .filter((entry) => entry.date.startsWith(todayKey))
    .reduce((sum, entry) => sum + entry.amount, 0);
  const latest = state.pointLogs[0];
  const latestStudent = latest ? students.find((student) => student.studentId === latest.studentId) : null;

  qs("#teacherStudentCount").textContent = totalStudents;
  qs("#teacherTodayPoints").textContent = formatPointDelta(todayPoints);
  qs("#teacherRecentActivity").innerHTML = latest
    ? `<b>${escapeHtml(latestStudent?.name || "학급")}</b> ${escapeHtml(latest.reason)} ${formatPointDelta(latest.amount)}`
    : "<b>학급</b> 최근 활동 기록이 없습니다.";
}

function renderHomePollPreview() {
  const preview = qs("#homePollPreview");
  const title = qs("#homePollTitle");
  const status = qs("#homePollStatus");
  if (!preview || !title || !status) return;

  const poll = state.polls[0];
  if (!poll) {
    preview.disabled = true;
    title.textContent = "참여할 설문이 없어요";
    status.textContent = "0개 대기";
    return;
  }

  preview.disabled = false;
  title.textContent = poll.question;
  status.textContent = `${pollParticipationLabel(poll)} ${poll.type === "text" ? "제출" : "참여"}`;
}

function renderClassGoal() {
  const card = qs("#classGoalCard");
  if (!card) return;

  const goal = state.classGoal;
  if (!goal || !goal.active || !goal.targetPoints) {
    card.hidden = true;
    return;
  }

  const progress = Math.max(0, Math.min(Number(goal.progress || 0), 100));
  card.hidden = false;
  qs("#classGoalTitle").textContent = goal.title;
  qs("#classGoalPercent").textContent = `${progress}%`;
  qs("#classGoalPoints").textContent = `${goal.currentPoints} / ${goal.targetPoints}P`;
  qs("#classGoalRemaining").textContent =
    goal.remainingPoints > 0 ? `${goal.remainingPoints}P 남음` : "목표 달성";
  qs("#classGoalReward").textContent = goal.rewardName ? `보상: ${goal.rewardName}` : "";
  qs("#classGoalBar").style.setProperty("--goal-progress", `${progress}%`);
}

function createNoticeItem(notice) {
  const item = document.createElement("article");
  item.className = "notice-item";
  item.innerHTML = `
    <span class="notice-meta"><i class="scope-dot ${notice.scope}"></i>${noticeMetaText(notice)}</span>
    <strong>${escapeHtml(notice.title)}</strong>
    <p>${escapeHtml(notice.body)}</p>
  `;
  return item;
}

function privateNoticeTargetText(notice) {
  if (notice.scope !== "private" || state.role !== "teacher") return "";
  const targetName = notice.targetName || students[notice.target]?.name || notice.targetStudentId || "대상 미지정";
  return ` · 대상 ${targetName}`;
}

function noticeMetaText(notice) {
  return `${labels[notice.scope] || "공지"}${privateNoticeTargetText(notice)} · ${notice.time}`;
}

function renderNotices() {
  const noticeList = qs("#noticeList");
  noticeList.innerHTML = "";
  const notices = visibleNotices();

  if (notices.length === 0) {
    const empty = document.createElement("article");
    empty.className = "notice-card";
    empty.innerHTML = "<p>표시할 공지가 없습니다.</p>";
    noticeList.appendChild(empty);
    return;
  }

  notices.forEach((notice) => {
    const card = document.createElement("article");
    card.className = "notice-card";
    card.innerHTML = `
      <header>
        <div>
          <h3>${escapeHtml(notice.title)}</h3>
          <span class="notice-meta">${notice.time}${privateNoticeTargetText(notice)}</span>
        </div>
        <span class="badge ${notice.scope}">${labels[notice.scope]}</span>
      </header>
      <p>${escapeHtml(notice.body)}</p>
    `;
    noticeList.appendChild(card);
  });
}

function renderPoints() {
  const student = students[state.activeStudent];
  renderPointProgress(student);
  renderLeaderboard();

  const list = qs("#pointHistory");
  list.innerHTML = "";
  state.history.forEach((entry) => {
    const item = document.createElement("article");
    item.className = "history-item";
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(entry.reason)}</strong>
        <small>${entry.date}</small>
      </div>
      <span class="delta">${formatPointDelta(entry.amount)}</span>
    `;
    list.appendChild(item);
  });
}

function renderPointProgress(student) {
  const next = nextAvatarMilestone(student.points);
  const previousMin = rewardItems()
    .filter((item) => item.min <= student.points)
    .reduce((max, item) => Math.max(max, item.min), 0);
  const nextMin = next?.min || Math.max(student.points, previousMin + 1);
  const progress = next
    ? Math.round(((student.points - previousMin) / (nextMin - previousMin)) * 100)
    : 100;

  qs("#nextRewardText").textContent = next
    ? `${next.name}까지 ${next.min - student.points}P 남음`
    : "모든 꾸미기 보상 해제";
  qs("#pointProgressText").textContent = `${Math.max(0, Math.min(progress, 100))}%`;
  qs("#pointProgressRing").style.setProperty("--progress", `${Math.max(0, Math.min(progress, 100))}%`);
}

function rankedStudents() {
  return students
    .map((student, index) => ({ ...student, index }))
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name, "ko"));
}

function renderLeaderboard() {
  const list = qs("#leaderboardList");
  if (!list) return;

  const ranked = rankedStudents();
  const activeRankIndex = ranked.findIndex((student) => student.index === state.activeStudent);
  const activeRank = activeRankIndex + 1;
  const visibleRows = ranked.slice(0, 5);
  const alreadyVisible = visibleRows.some((student) => student.index === state.activeStudent);

  if (!alreadyVisible && activeRankIndex >= 0) {
    visibleRows.push(ranked[activeRankIndex]);
  }

  qs("#myRankLabel").textContent = `내 순위 ${activeRank}위`;
  list.innerHTML = "";
  visibleRows.forEach((student) => {
    const rank = ranked.findIndex((item) => item.index === student.index) + 1;
    const isMe = student.index === state.activeStudent;
    const { base, clothing, background } = getAvatarParts(student);
    const row = document.createElement("article");
    row.className = `leaderboard-row ${isMe ? "is-me" : ""}`;
    row.innerHTML = `
      <span class="rank-number">${rank}</span>
      <div class="leader-avatar" aria-hidden="true">${avatarFigureMarkup(base, clothing, background)}</div>
      <div class="leader-info">
        <strong>${escapeHtml(student.name)}${isMe ? " · 나" : ""}</strong>
        <small>${escapeHtml(student.title)}</small>
      </div>
      <b>${student.points}P</b>
    `;
    list.appendChild(row);
  });
}

function getAvatarParts(student) {
  const base = avatarBases.find((item) => item.id === student.avatar.base) || avatarBases[0];
  let clothing = avatarClothing.find((item) => item.id === student.avatar.clothing) || avatarClothing[0];
  let background = avatarBackgrounds.find((item) => item.id === student.avatar.background) || avatarBackgrounds[0];

  if (clothing.min > student.points) {
    student.avatar.clothing = "basic";
    clothing = avatarClothing[0];
    saveAvatarChoices();
  }

  if (background.min > student.points) {
    student.avatar.background = "basic-bg";
    background = avatarBackgrounds[0];
    saveAvatarChoices();
  }

  return { base, clothing, background };
}

function unlockedItems(items, points) {
  return items.filter((item) => item.min <= points);
}

function rewardItems() {
  return [...avatarBackgrounds, ...avatarClothing].filter((item) => item.min > 0).sort((a, b) => a.min - b.min);
}

function nextAvatarMilestone(points) {
  return rewardItems().find((item) => item.min > points);
}

function avatarImagePath(base, clothing) {
  const asset = clothing.asset ? `${base.id}-${clothing.asset}` : base.asset;
  return `./assets/avatars/${asset}.png?v=${imageAssetVersion}`;
}

function backgroundImagePath(background) {
  return `./assets/backgrounds/${background.asset}.png?v=${imageAssetVersion}`;
}

function avatarFigureMarkup(base, clothing, background = avatarBackgrounds[0]) {
  const backgroundMarkup = background.asset
    ? `<img class="avatar-background-image" src="${backgroundImagePath(background)}" alt="" loading="lazy" />`
    : "";
  return `
    <div class="avatar-figure clothing-${clothing.id} background-${background.id}">
      ${backgroundMarkup}
      <img class="avatar-image" src="${avatarImagePath(base, clothing)}" alt="" loading="lazy" />
    </div>
  `;
}

function renderAvatar(selector, student) {
  const stage = qs(selector);
  if (!stage) return;

  const { base, clothing, background } = getAvatarParts(student);
  stage.innerHTML = avatarFigureMarkup(base, clothing, background);
}

function renderAvatarWorkshop() {
  const student = students[state.activeStudent];
  const { base, clothing, background } = getAvatarParts(student);
  const baseCount = avatarBases.length;
  const unlockedClothing = unlockedItems(avatarClothing, student.points);
  const unlockedBackgrounds = unlockedItems(avatarBackgrounds, student.points);
  const next = nextAvatarMilestone(student.points);

  qs("#baseUnlockLabel").textContent = `${baseCount}개 선택 가능`;
  qs("#clothingUnlockLabel").textContent = `${unlockedClothing.length}/${avatarClothing.length}개 해제`;
  qs("#backgroundUnlockLabel").textContent = `${unlockedBackgrounds.length}/${avatarBackgrounds.length}개 해제`;
  qs("#avatarMilestoneText").textContent = next
    ? `${next.name}까지 ${next.min - student.points}P 남음`
    : "모든 꾸미기 보상 해제";
  renderAvatar("#avatarPreview", student);
  renderItemList("#baseList", avatarBases, base.id, "base", student.points, base, clothing, background);
  renderItemList("#clothingList", avatarClothing, clothing.id, "clothing", student.points, base, clothing, background);
  renderItemList("#backgroundList", avatarBackgrounds, background.id, "background", student.points, base, clothing, background);
}

function renderItemList(selector, items, selectedId, category, points, base, clothing, background) {
  const list = qs(selector);
  if (!list) return;

  list.innerHTML = "";
  items.forEach((item) => {
    const isUnlocked = (item.min || 0) <= points;
    const isSelected = item.id === selectedId;
    let preview = avatarFigureMarkup(base, clothing, item);
    if (category === "base") {
      preview = avatarFigureMarkup(item, clothing, background);
    } else if (category === "clothing") {
      preview = avatarFigureMarkup(base, item, background);
    }
    const option = document.createElement("button");
    option.type = "button";
    option.className = `item-option ${isSelected ? "is-selected" : ""} ${isUnlocked ? "" : "is-locked"}`;
    option.dataset.avatarItem = item.id;
    option.dataset.avatarCategory = category;
    option.innerHTML = `
      <div class="item-preview" aria-hidden="true">${preview}</div>
      <span>
        <strong>${item.name}</strong>
        <small>${item.desc}</small>
      </span>
      <b>${isSelected ? "사용 중" : isUnlocked ? "선택" : `${item.min - points}P 남음`}</b>
    `;
    list.appendChild(option);
  });
}

function renderPolls() {
  const list = qs("#pollList");
  list.innerHTML = "";
  if (state.role === "teacher") {
    renderTeacherPollResults(list);
    return;
  }

  state.polls.forEach((poll, pollIndex) => {
    const isTextSurvey = poll.type === "text";
    const total = pollParticipationCount(poll);
    const card = document.createElement("article");
    card.className = "poll-card";
    card.innerHTML = `
      <header>
        <div>
          <h3>${escapeHtml(poll.question)}</h3>
          <span class="notice-meta">${poll.closes}</span>
        </div>
        <span class="badge">${isTextSurvey ? "주관식" : "투표"} · ${pollParticipationLabel(poll)}</span>
      </header>
      <div class="${isTextSurvey ? "survey-response" : "poll-options"}"></div>
    `;

    if (isTextSurvey) {
      const responseArea = card.querySelector(".survey-response");
      responseArea.innerHTML = `
        <textarea class="survey-textarea" rows="4" data-poll-index="${pollIndex}" placeholder="내 생각을 적어 주세요."></textarea>
        <button class="secondary-action survey-submit" type="button" data-poll-index="${pollIndex}">
          응답 추가
        </button>
      `;
    } else {
      const options = card.querySelector(".poll-options");
      poll.options.forEach((option, optionIndex) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `option-button ${poll.selected === optionIndex ? "is-selected" : ""}`;
        button.disabled = Boolean(poll.isSubmitting);
        button.dataset.pollIndex = pollIndex;
        button.dataset.optionIndex = optionIndex;
        button.dataset.optionId = option.optionId || "";
        button.innerHTML = `
          <span>${escapeHtml(option.text)}</span>
          <span class="option-count">${option.count}표</span>
        `;
        options.appendChild(button);
      });
    }
    list.appendChild(card);
  });
}

function renderTeacherPollResults(list) {
  if (!state.polls.length) {
    const empty = document.createElement("article");
    empty.className = "poll-card";
    empty.innerHTML = "<p>아직 생성된 설문이 없습니다.</p>";
    list.appendChild(empty);
    return;
  }

  state.polls.forEach((poll) => {
    const isTextSurvey = poll.type === "text";
    const total = pollParticipationCount(poll);
    const card = document.createElement("article");
    card.className = "poll-card teacher-result-card";
    card.innerHTML = `
      <header>
        <div>
          <h3>${escapeHtml(poll.question)}</h3>
          <span class="notice-meta">${escapeHtml(poll.closes || "진행 중")}</span>
        </div>
        <span class="badge">${isTextSurvey ? "주관식" : "투표"} · ${pollParticipationLabel(poll)}</span>
      </header>
      <div class="${isTextSurvey ? "survey-result-list" : "poll-result-list"}"></div>
    `;

    if (isTextSurvey) {
      renderTextSurveyResults(card.querySelector(".survey-result-list"), poll);
    } else {
      renderChoicePollResults(card.querySelector(".poll-result-list"), poll, total);
    }

    list.appendChild(card);
  });
}

function renderChoicePollResults(container, poll, total) {
  if (!poll.options.length) {
    container.innerHTML = '<p class="empty-result">선택지가 없습니다.</p>';
    return;
  }

  poll.options.forEach((option) => {
    const count = Number(option.count || 0);
    const percent = total ? Math.round((count / total) * 100) : 0;
    const row = document.createElement("article");
    row.className = "result-option";
    row.innerHTML = `
      <div class="result-option-head">
        <strong>${escapeHtml(option.text)}</strong>
        <span>${count}표 · ${percent}%</span>
      </div>
      <i aria-hidden="true" style="--value: ${percent}%"></i>
    `;
    container.appendChild(row);
  });
}

function renderTextSurveyResults(container, poll) {
  const responses = poll.responses || [];
  if (!responses.length) {
    container.innerHTML = '<p class="empty-result">아직 제출된 응답이 없습니다.</p>';
    return;
  }

  responses.forEach((response) => {
    const item = document.createElement("article");
    item.className = "text-result";
    const studentName = response.studentName || students[response.student]?.name || "학생";
    item.innerHTML = `
      <strong>${escapeHtml(studentName)}</strong>
      <p>${escapeHtml(response.text)}</p>
      ${response.updatedAt ? `<small>${escapeHtml(response.updatedAt)}</small>` : ""}
    `;
    container.appendChild(item);
  });
}

function galleryAlbums() {
  return state.gallery?.albums || [];
}

function activeGalleryAlbum() {
  if (!state.galleryActiveAlbumId) return null;
  return galleryAlbums().find((album) => album.id === state.galleryActiveAlbumId) || null;
}

function maybeLoadGallery() {
  if (state.activeTab === "gallery" && state.galleryStatus === "idle") {
    loadGallery();
  }
}

async function loadGallery(force = false) {
  if (!state.apiToken) {
    state.galleryStatus = "error";
    state.galleryError = "로그인이 필요합니다.";
    renderGallery();
    return;
  }
  if (state.galleryStatus === "loading") return;
  if (!force && state.galleryStatus === "ready") return;

  state.galleryStatus = "loading";
  state.galleryError = "";
  renderGallery();
  try {
    const gallery = await apiRequest("getGallery", { token: state.apiToken });
    state.gallery = galleryFromApi(gallery);
    state.galleryStatus = "ready";
    if (state.galleryActiveAlbumId && !galleryAlbums().some((album) => album.id === state.galleryActiveAlbumId)) {
      state.galleryActiveAlbumId = "";
    }
    renderGallery();
  } catch (error) {
    state.galleryStatus = "error";
    state.galleryError = error.message || "갤러리를 불러오지 못했습니다.";
    renderGallery();
  }
}

function renderGallery() {
  const warning = qs("#galleryWarning");
  const title = qs("#galleryTitle");
  const status = qs("#galleryStatus");
  const albumList = qs("#galleryAlbumList");
  const photoSection = qs("#galleryPhotoSection");
  const photoList = qs("#galleryPhotoList");
  if (!warning || !title || !status || !albumList || !photoSection || !photoList) return;

  const gallery = state.gallery;
  warning.textContent =
    gallery?.warning ||
    "이 갤러리의 사진은 동명중 1-1 학급 구성원만 보기 위한 자료입니다. 사진을 저장, 캡처, 외부 공유하지 말아 주세요.";
  title.textContent = gallery?.rootFolderName || "앨범";
  albumList.innerHTML = "";
  photoList.innerHTML = "";
  photoSection.hidden = true;

  if (state.galleryStatus === "idle") {
    status.textContent = "갤러리를 불러오는 중입니다.";
    return;
  }
  if (state.galleryStatus === "loading") {
    status.textContent = "갤러리를 불러오는 중입니다.";
    return;
  }
  if (state.galleryStatus === "error") {
    status.textContent = state.galleryError || "갤러리를 불러오지 못했습니다.";
    return;
  }

  const albums = galleryAlbums();
  if (!albums.length) {
    status.textContent = "아직 등록된 앨범이 없습니다.";
    return;
  }

  status.textContent = gallery?.updatedAt ? `마지막 업데이트 ${gallery.updatedAt}` : `${albums.length}개 앨범`;
  albums.forEach((album) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `gallery-album-card ${album.id === state.galleryActiveAlbumId ? "is-active" : ""}`;
    button.dataset.galleryAlbumId = album.id;
    button.innerHTML = `
      <div class="gallery-cover">
        ${
          album.coverUrl
            ? `<img src="${escapeHtml(album.coverUrl)}" alt="" loading="lazy" decoding="async" draggable="false" />`
            : "<span>사진 없음</span>"
        }
      </div>
      <strong>${escapeHtml(album.title)}</strong>
      <small>${album.photoCount}장</small>
    `;
    albumList.appendChild(button);
  });

  const album = activeGalleryAlbum();
  if (!album) return;

  photoSection.hidden = false;
  qs("#galleryAlbumTitle").textContent = album.title;
  qs("#galleryAlbumCount").textContent = `${album.photoCount}장`;
  if (!album.photos.length) {
    photoList.innerHTML = '<p class="empty-result">이 앨범에는 아직 사진이 없습니다.</p>';
    return;
  }

  album.photos.forEach((photo) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-photo-card";
    button.dataset.galleryPhotoId = photo.id;
    button.innerHTML = `
      <img src="${escapeHtml(photo.thumbnailUrl)}" alt="${escapeHtml(photo.title)}" loading="lazy" decoding="async" draggable="false" />
      <span>${escapeHtml(photo.title)}</span>
    `;
    photoList.appendChild(button);
  });
}

function findGalleryPhoto(photoId) {
  for (const album of galleryAlbums()) {
    const photo = album.photos.find((entry) => entry.id === photoId);
    if (photo) return photo;
  }
  return null;
}

function openGalleryPhoto(photoId) {
  const photo = findGalleryPhoto(photoId);
  const lightbox = qs("#galleryLightbox");
  if (!photo || !lightbox) return;
  qs("#galleryLightboxImage").src = photo.imageUrl;
  qs("#galleryLightboxImage").alt = photo.title;
  qs("#galleryLightboxTitle").textContent = photo.title;
  qs("#galleryLightboxDate").textContent = photo.createdAt || "";
  lightbox.hidden = false;
}

function closeGalleryPhoto() {
  const lightbox = qs("#galleryLightbox");
  const image = qs("#galleryLightboxImage");
  if (!lightbox || !image) return;
  lightbox.hidden = true;
  image.removeAttribute("src");
}

function renderAdminSelects() {
  const selects = [qs("#noticeTarget"), qs("#pointStudent"), qs("#titleStudent")];
  selects.forEach((select) => {
    select.innerHTML = "";
    students.forEach((student, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = student.name;
      select.appendChild(option);
    });
  });
  syncTitleField();
}

function syncLoginButtonState() {
  const loginButton = qs("#loginButton");
  if (!loginButton) return;

  const waitingForStudents = state.role === "student" && students.length === 0;
  loginButton.disabled = waitingForStudents;
}

function renderStudentSelect() {
  const select = qs("#studentSelect");
  if (!select) return;

  const currentValue = select.value;
  select.innerHTML = "";

  if (!students.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = state.studentListStatus === "error" ? studentListErrorText : studentListLoadingText;
    select.appendChild(option);
    select.disabled = true;
    syncLoginButtonState();
    return;
  }

  select.disabled = false;
  students.forEach((student, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.dataset.studentId = student.studentId || "";
    option.textContent = student.name;
    select.appendChild(option);
  });
  if (currentValue && Number(currentValue) < students.length) {
    select.value = currentValue;
  }
  syncLoginButtonState();
}

function setAdminPanel(panel) {
  qsa(".admin-tab").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.adminTarget === panel);
  });
  qsa(".admin-panel").forEach((target) => {
    target.classList.toggle("is-active", target.dataset.adminPanel === panel);
  });
  if (panel === "goal") {
    syncClassGoalFields();
  }
}

function renderAll() {
  app.classList.toggle("teacher-mode", state.role === "teacher");
  qs("#roleLabel").textContent = state.role === "teacher" ? "선생님 모드" : "학생 모드";
  renderHome();
  renderNotices();
  renderPoints();
  renderAvatarWorkshop();
  renderPolls();
  renderGallery();
}

function syncTitleField() {
  const titleStudent = qs("#titleStudent");
  const titleText = qs("#titleText");
  if (!titleStudent || !titleText) return;

  const student = students[Number(titleStudent.value) || 0];
  titleText.value = student?.title || "";
}

function syncClassGoalFields() {
  const title = qs("#goalTitle");
  const targetPoints = qs("#goalTargetPoints");
  const rewardName = qs("#goalRewardName");
  const summary = qs("#goalCurrentSummary");
  if (!title || !targetPoints || !rewardName || !summary) return;

  const goal = state.classGoal;
  title.value = goal?.title || "";
  targetPoints.value = goal?.targetPoints || "";
  rewardName.value = goal?.rewardName || "";

  if (!goal || !goal.targetPoints) {
    summary.textContent = "아직 설정된 공동 목표가 없습니다.";
    return;
  }

  summary.textContent = `현재 ${goal.currentPoints}P / 목표 ${goal.targetPoints}P · ${goal.remainingPoints > 0 ? `${goal.remainingPoints}P 남음` : "목표 달성"}`;
}

async function addNotice() {
  const scope = qs("#noticeScope").value;
  const title = qs("#noticeTitle").value.trim();
  const body = qs("#noticeBody").value.trim();
  if (!title || !body) {
    showToast("제목과 내용을 입력해 주세요.");
    return;
  }

  if (state.apiToken) {
    try {
      const targetIndex = Number(qs("#noticeTarget").value);
      const dashboard = await apiRequest("addNotice", {
        token: state.apiToken,
        scope,
        title,
        body,
        targetStudentId: scope === "private" ? students[targetIndex]?.studentId : "",
      });
      applyTeacherPayload(dashboard);
      renderAll();
      showToast("공지 저장 완료");
      return;
    } catch (error) {
      showToast(error.message || "공지 저장에 실패했습니다.");
      return;
    }
  }

  state.notices.unshift({
    scope,
    title,
    body,
    time: "방금",
    target: scope === "private" ? Number(qs("#noticeTarget").value) : null,
    targetName: scope === "private" ? students[Number(qs("#noticeTarget").value)]?.name || "" : "",
    unread: true,
  });
  renderAll();
  showToast("공지가 등록되었습니다.");
}

async function addPoints() {
  const studentIndex = Number(qs("#pointStudent").value);
  const amount = Number(qs("#pointAmount").value);
  const reason = qs("#pointReason").value.trim();
  if (!amount || !reason) {
    showToast("포인트와 이유를 확인해 주세요.");
    return;
  }

  if (state.apiToken && students[studentIndex]?.studentId) {
    try {
      const dashboard = await apiRequest("addPoints", {
        token: state.apiToken,
        studentId: students[studentIndex].studentId,
        amount,
        reason,
      });
      applyTeacherPayload(dashboard);
      renderAll();
      showToast("포인트 저장 완료");
      return;
    } catch (error) {
      showToast(error.message || "포인트 저장에 실패했습니다.");
      return;
    }
  }

  students[studentIndex].points += amount;
  if (studentIndex === state.activeStudent) {
    state.history.unshift({ reason, amount, date: "방금" });
  }
  renderAll();
  showToast(`${students[studentIndex].name}님에게 ${amount}P를 반영했습니다.`);
}

async function updateStudentTitle() {
  const studentIndex = Number(qs("#titleStudent").value);
  const title = qs("#titleText").value.trim();
  if (!title) {
    showToast("칭호를 입력해 주세요.");
    return;
  }

  if (state.apiToken && students[studentIndex]?.studentId) {
    try {
      const dashboard = await apiRequest("updateStudentTitle", {
        token: state.apiToken,
        studentId: students[studentIndex].studentId,
        title,
      });
      applyTeacherPayload(dashboard);
      renderAll();
      syncTitleField();
      showToast("칭호 저장 완료");
      return;
    } catch (error) {
      showToast(error.message || "칭호 저장에 실패했습니다.");
      return;
    }
  }

  students[studentIndex].title = title;
  saveStudentProfiles();
  renderAll();
  syncTitleField();
  showToast(`${students[studentIndex].name}님의 칭호를 저장했습니다.`);
}

async function updateClassGoal() {
  const title = qs("#goalTitle").value.trim();
  const targetPoints = Number(qs("#goalTargetPoints").value);
  const rewardName = qs("#goalRewardName").value.trim();

  if (!title || !targetPoints || targetPoints < 1) {
    showToast("목표 이름과 목표 포인트를 확인해 주세요.");
    return;
  }

  if (state.apiToken) {
    try {
      const dashboard = await apiRequest("updateClassGoal", {
        token: state.apiToken,
        goalId: state.classGoal?.goalId || "G001",
        title,
        targetPoints,
        rewardName,
      });
      applyTeacherPayload(dashboard);
      renderAll();
      syncClassGoalFields();
      showToast("공동 목표 저장 완료");
      return;
    } catch (error) {
      showToast(error.message || "공동 목표 저장에 실패했습니다.");
      return;
    }
  }

  const currentPoints = students.reduce((sum, student) => sum + Number(student.points || 0), 0);
  state.classGoal = classGoalFromApi({
    goalId: "G001",
    title,
    targetPoints,
    currentPoints,
    rewardName,
    active: true,
  });
  renderAll();
  syncClassGoalFields();
  showToast("공동 목표를 저장했습니다.");
}

async function addPoll() {
  const type = qs("#pollType").value;
  const question = qs("#pollQuestion").value.trim();
  const options = qs("#pollOptions")
    .value.split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!question) {
    showToast("질문을 입력해 주세요.");
    return;
  }

  if (type === "choice" && options.length < 2) {
    showToast("질문과 선택지 2개 이상을 입력해 주세요.");
    return;
  }

  if (state.apiToken) {
    try {
      const dashboard = await apiRequest("createSurvey", {
        token: state.apiToken,
        type,
        question,
        options,
      });
      applyTeacherPayload(dashboard);
      renderAll();
      showToast(type === "text" ? "주관식 설문 저장 완료" : "투표 저장 완료");
      return;
    } catch (error) {
      showToast(error.message || "설문 저장에 실패했습니다.");
      return;
    }
  }

  const newPoll =
    type === "text"
      ? {
          type,
          question,
          closes: "진행 중",
          responses: [],
        }
      : {
          type,
          question,
          closes: "진행 중",
          options: options.map((text) => ({ text, count: 0 })),
          selected: null,
          isSubmitting: false,
        };

  state.polls.unshift(newPoll);
  renderAll();
  showToast(type === "text" ? "주관식 설문이 열렸습니다." : "투표가 열렸습니다.");
}

function syncPollTypeFields() {
  const isChoice = qs("#pollType").value === "choice";
  qs(".poll-options-field").classList.toggle("is-hidden", !isChoice);
  qs("#addPollButton").textContent = isChoice ? "투표 열기" : "설문 열기";
}

async function submitTextSurvey(pollIndex) {
  const poll = state.polls[pollIndex];
  if (!poll || poll.type !== "text") return;

  const textarea = qs(`textarea[data-poll-index="${pollIndex}"]`);
  const text = textarea.value.trim();
  if (!text) {
    showToast("응답 내용을 입력해 주세요.");
    return;
  }

  if (state.apiToken && poll.id) {
    try {
      const home = await apiRequest("submitSurveyResponse", {
        token: state.apiToken,
        surveyId: poll.id,
        textResponse: text,
      });
      applyStudentPayload(home);
      renderAll();
      showToast("응답 저장 완료");
      return;
    } catch (error) {
      showToast(error.message || "응답 저장에 실패했습니다.");
      return;
    }
  }

  poll.responses.push({ student: state.activeStudent, text });
  renderPolls();
  showToast("주관식 응답이 추가되었습니다.");
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[char];
  });
}

qsa("[data-login-role]").forEach((button) => {
  button.addEventListener("click", () => setLoginRole(button.dataset.loginRole));
});

qs("#loginButton").addEventListener("click", async () => {
  const loginButton = qs("#loginButton");
  loginButton.disabled = true;
  try {
    if (state.role === "teacher") {
      const data = await apiRequest("teacherLogin", {
        teacherCode: qs("#teacherCode").value.trim(),
      });
      state.apiToken = data.token;
      state.apiStudentId = "";
      applyTeacherPayload(data.dashboard);
      saveSession("teacher", data.token);
    } else {
      if (!students.length) {
        showToast("\uD559\uC0DD \uBA85\uB2E8\uC744 \uC544\uC9C1 \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4.");
        return;
      }

      const selectedStudent = Number(qs("#studentSelect").value);
      const student = students[selectedStudent];
      const data = await apiRequest("studentLogin", {
        studentId: student?.studentId,
        number: student?.number,
        name: student?.name,
        password: qs("#studentPassword").value.trim(),
      });
      state.apiToken = data.token;
      state.apiStudentId = data.home?.student?.studentId || student?.studentId || "";
      applyStudentPayload(data.home);
      saveSession("student", data.token, state.apiStudentId);
    }

    setScreen("main");
    setTab("home");
    renderAll();
    return;
  } catch (error) {
    showToast(error.message || "로그인에 실패했습니다.");
    return;
  } finally {
    syncLoginButtonState();
  }

  if (state.role === "teacher" && qs("#teacherCode").value !== "1234") {
    showToast("교사용 코드를 확인해 주세요.");
    return;
  }

  const selectedStudent = Number(qs("#studentSelect").value);
  if (state.role === "student" && qs("#studentPassword").value !== students[selectedStudent].password) {
    showToast("학생 비밀번호를 확인해 주세요.");
    return;
  }

  state.activeStudent = selectedStudent;
  setScreen("main");
  setTab("home");
  renderAll();
});

qs("#logoutButton").addEventListener("click", () => {
  if (state.apiToken) {
    apiRequest("logout", { token: state.apiToken }).catch(() => {});
  }
  state.apiToken = "";
  state.apiStudentId = "";
  state.gallery = null;
  state.galleryStatus = "idle";
  state.galleryError = "";
  state.galleryActiveAlbumId = "";
  clearSavedSession();
  qs("#studentPassword").value = "";
  setScreen("login");
  showToast("로그아웃되었습니다.");
});

qsa("[data-tab-target]").forEach((button) => {
  button.addEventListener("click", () => setTab(button.dataset.tabTarget));
});

qsa("[data-jump-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    setTab(button.dataset.jumpTab);
    if (button.dataset.adminPanel) {
      setAdminPanel(button.dataset.adminPanel);
    }
  });
});

qs("#galleryRefreshButton").addEventListener("click", () => loadGallery(true));

qs("#galleryAlbumList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-gallery-album-id]");
  if (!button) return;
  state.galleryActiveAlbumId = button.dataset.galleryAlbumId;
  renderGallery();
});

qs("#galleryPhotoList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-gallery-photo-id]");
  if (!button) return;
  openGalleryPhoto(button.dataset.galleryPhotoId);
});

qs("#galleryLightboxClose").addEventListener("click", closeGalleryPhoto);

qs("#galleryLightbox").addEventListener("click", (event) => {
  if (event.target === event.currentTarget) {
    closeGalleryPhoto();
  }
});

qs('[data-tab="gallery"]').addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

qs('[data-tab="gallery"]').addEventListener("dragstart", (event) => {
  if (event.target.matches("img")) {
    event.preventDefault();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeGalleryPhoto();
  }
});

qsa("[data-notice-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    state.noticeFilter = button.dataset.noticeFilter;
    qsa("[data-notice-filter]").forEach((target) => {
      target.classList.toggle("is-active", target === button);
    });
    renderNotices();
  });
});

qsa(".admin-tab").forEach((button) => {
  button.addEventListener("click", () => setAdminPanel(button.dataset.adminTarget));
});

qs("#noticeScope").addEventListener("change", (event) => {
  qs(".private-target").classList.toggle("is-active", event.target.value === "private");
});

qs("#addNoticeButton").addEventListener("click", addNotice);
qs("#addPointButton").addEventListener("click", addPoints);
qs("#pollType").addEventListener("change", syncPollTypeFields);
qs("#addPollButton").addEventListener("click", addPoll);
qs("#titleStudent").addEventListener("change", syncTitleField);
qs("#updateTitleButton").addEventListener("click", updateStudentTitle);
qs("#updateClassGoalButton").addEventListener("click", updateClassGoal);

qs("#pollList").addEventListener("click", async (event) => {
  const submitButton = event.target.closest(".survey-submit");
  if (submitButton) {
    submitTextSurvey(Number(submitButton.dataset.pollIndex));
    return;
  }

  const button = event.target.closest(".option-button");
  if (!button) return;

  const pollIndex = Number(button.dataset.pollIndex);
  const optionIndex = Number(button.dataset.optionIndex);
  const poll = state.polls[pollIndex];
  const optionId = button.dataset.optionId;
  if (!poll || poll.isSubmitting) return;

  if (poll.selected === optionIndex) {
    showToast("이미 선택한 항목입니다.");
    return;
  }

  if (state.apiToken && poll?.id && optionId) {
    poll.isSubmitting = true;
    renderPolls();
    try {
      const home = await apiRequest("submitSurveyResponse", {
        token: state.apiToken,
        surveyId: poll.id,
        optionId,
      });
      applyStudentPayload(home);
      renderAll();
      showToast("응답 저장 완료");
      return;
    } catch (error) {
      poll.isSubmitting = false;
      renderPolls();
      showToast(error.message || "응답 저장에 실패했습니다.");
      return;
    }
  }

  if (poll.selected !== null) {
    poll.options[poll.selected].count -= 1;
  }
  poll.selected = optionIndex;
  poll.options[optionIndex].count += 1;
  renderPolls();
  showToast("응답이 반영되었습니다.");
});

async function handleAvatarItemSelect(event) {
  const button = event.target.closest("[data-avatar-item]");
  if (!button) return;

  const student = students[state.activeStudent];
  const category = button.dataset.avatarCategory;
  const itemsByCategory = {
    base: avatarBases,
    clothing: avatarClothing,
    background: avatarBackgrounds,
  };
  const items = itemsByCategory[category] || [];
  const item = items.find((entry) => entry.id === button.dataset.avatarItem);
  if (!item) return;

  if ((item.min || 0) > student.points) {
    showToast(`${item.name}까지 ${item.min - student.points}P 남았어요.`);
    return;
  }

  if (state.apiToken) {
    const nextAvatar = {
      baseId: category === "base" ? item.id : student.avatar.base,
      clothingId: category === "clothing" ? item.id : student.avatar.clothing,
      backgroundId: category === "background" ? item.id : student.avatar.background,
    };
    try {
      const home = await apiRequest("updateAvatar", {
        token: state.apiToken,
        ...nextAvatar,
      });
      applyStudentPayload(home);
      renderAll();
      showToast(`${item.name} 적용 완료`);
      return;
    } catch (error) {
      showToast(error.message || "아바타 저장에 실패했습니다.");
      return;
    }
  }

  if (category === "base") {
    student.avatar.base = item.id;
  } else if (category === "clothing") {
    student.avatar.clothing = item.id;
  } else if (category === "background") {
    student.avatar.background = item.id;
  }
  saveAvatarChoices();
  renderAll();
  showToast(`${item.name}을 적용했습니다.`);
}

qs("#baseList").addEventListener("click", handleAvatarItemSelect);
qs("#clothingList").addEventListener("click", handleAvatarItemSelect);
qs("#backgroundList").addEventListener("click", handleAvatarItemSelect);

installNetworkLock();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

renderStudentSelect();
renderAdminSelects();
syncPollTypeFields();

async function initApp() {
  if (navigator.onLine === false) return;

  const restored = await restoreSavedSession();
  if (!restored) {
    loadPublicData();
  }
}

initApp();
