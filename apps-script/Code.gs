const HEADER_ROW = 4;
const FIRST_DATA_ROW = HEADER_ROW + 1;
const SESSION_TTL_SECONDS = 6 * 60 * 60;
const DEFAULT_TIMEZONE = "Asia/Seoul";
let requestCache_ = {};

function doGet(e) {
  return handleRequest_(e, "GET");
}

function doPost(e) {
  return handleRequest_(e, "POST");
}

function doOptions(e) {
  return json_({
    ok: true,
    data: {
      message: "Use POST with text/plain JSON to avoid browser preflight.",
    },
  });
}

function setupCheck() {
  const data = pingData_();
  Logger.log(JSON.stringify(data, null, 2));
  return data;
}

function handleRequest_(e, method) {
  requestCache_ = {};
  try {
    const req = parseRequest_(e);
    const action = text_(req.action || "ping");
    const data = route_(action, req, method);
    return json_({ ok: true, data });
  } catch (error) {
    return json_({
      ok: false,
      error: {
        code: error.code || "SERVER_ERROR",
        message: error.message || String(error),
      },
    });
  }
}

function route_(action, req, method) {
  switch (action) {
    case "ping":
      return pingData_();
    case "getPublicData":
      return getPublicData_();
    case "studentLogin":
      return studentLogin_(req);
    case "teacherLogin":
      return teacherLogin_(req);
    case "getStudentHome":
      return getStudentHome_(req);
    case "getTeacherDashboard":
      return getTeacherDashboard_(req);
    case "updateAvatar":
      return updateAvatar_(req);
    case "submitSurveyResponse":
      return submitSurveyResponse_(req);
    case "addNotice":
      return addNotice_(req);
    case "addPoints":
      return addPoints_(req);
    case "updateStudentTitle":
      return updateStudentTitle_(req);
    case "createSurvey":
      return createSurvey_(req);
    case "updateClassGoal":
      return updateClassGoal_(req);
    case "logout":
      return logout_(req);
    default:
      throw appError_("UNKNOWN_ACTION", `Unknown action: ${action}`);
  }
}

function parseRequest_(e) {
  const req = {};
  if (e && e.parameter) {
    Object.keys(e.parameter).forEach((key) => {
      req[key] = e.parameter[key];
    });
  }

  if (e && e.postData && e.postData.contents) {
    const raw = e.postData.contents;
    try {
      const body = JSON.parse(raw);
      Object.keys(body).forEach((key) => {
        req[key] = body[key];
      });
    } catch (error) {
      req.rawBody = raw;
    }
  }

  return req;
}

function pingData_() {
  return {
    app: "Classroom HQ API",
    spreadsheetName: ss_().getName(),
    time: nowString_(),
    timezone: timezone_(),
  };
}

function getPublicData_() {
  return {
    settings: publicSettings_(),
    students: activeStudentRows_().map((row) => publicStudent_(row.record)),
    classGoal: classGoal_(),
  };
}

function studentLogin_(req) {
  const login = text_(req.studentId || req.student_id || req.number || req.name);
  const password = text_(req.password || req.passwordCode || req.password_code);
  if (!login || !password) {
    throw appError_("LOGIN_REQUIRED", "Student login and password are required.");
  }

  const row = findStudentForLogin_(login);
  if (!row || !isTruthy_(row.record.active)) {
    throw appError_("STUDENT_NOT_FOUND", "Student was not found or is inactive.");
  }

  const expected = rowText_(row, "password_code");
  if (password !== expected) {
    throw appError_("INVALID_PASSWORD", "Student password is incorrect.");
  }

  const studentId = rowText_(row, "student_id");
  const token = createSession_("student", studentId);
  return {
    token,
    home: studentPayload_(studentId),
  };
}

function teacherLogin_(req) {
  const teacherCode = text_(req.teacherCode || req.teacher_code || req.password);
  if (!teacherCode) {
    throw appError_("TEACHER_CODE_REQUIRED", "Teacher code is required.");
  }

  const settings = settings_();
  if (teacherCode !== text_(settings.teacher_code)) {
    throw appError_("INVALID_TEACHER_CODE", "Teacher code is incorrect.");
  }

  const token = createSession_("teacher", "teacher");
  return {
    token,
    dashboard: teacherPayload_(),
  };
}

function getStudentHome_(req) {
  const auth = requireStudent_(req.token);
  return studentPayload_(auth.studentId);
}

function getTeacherDashboard_(req) {
  requireTeacher_(req.token);
  return teacherPayload_();
}

function updateAvatar_(req) {
  const auth = requireStudent_(req.token);
  const studentRow = auth.row;
  const points = totalPoints_(studentRow.record);

  const baseId = text_(req.baseId || req.avatarBaseId || req.avatar_base_id || rowText_(studentRow, "avatar_base_id") || "boy");
  const clothingId = text_(req.clothingId || req.clothingItemId || req.clothing_item_id || rowText_(studentRow, "clothing_item_id") || "basic");
  const backgroundId = text_(req.backgroundId || req.backgroundItemId || req.background_item_id || rowText_(studentRow, "background_item_id") || "basic-bg");
  assertAvatarChoice_(baseId, "base", points);
  assertAvatarChoice_(clothingId, "clothing", points);
  assertAvatarChoice_(backgroundId, "background", points);

  setRecordFields_("Students", studentRow.rowNumber, {
    avatar_base_id: baseId,
    clothing_item_id: clothingId,
    background_item_id: backgroundId,
  });

  SpreadsheetApp.flush();
  return studentPayload_(auth.studentId);
}

function submitSurveyResponse_(req) {
  const auth = requireStudent_(req.token);
  const studentId = auth.studentId;
  const surveyId = text_(req.surveyId || req.survey_id);
  if (!surveyId) {
    throw appError_("SURVEY_ID_REQUIRED", "Survey ID is required.");
  }

  const surveyRow = findRowByField_("Surveys", "survey_id", surveyId);
  if (!surveyRow || text_(surveyRow.record.status).toLowerCase() !== "open") {
    throw appError_("SURVEY_CLOSED", "Survey is not open.");
  }
  if (!isWithinDateWindow_(surveyRow.record.opens_at, surveyRow.record.closes_at)) {
    throw appError_("SURVEY_NOT_AVAILABLE", "Survey is outside its open period.");
  }

  const type = text_(surveyRow.record.type).toLowerCase() === "text" ? "text" : "choice";
  const allowEdit = isTruthy_(surveyRow.record.allow_edit);
  const existing = findSurveyResponse_(surveyId, studentId);
  if (existing && !allowEdit) {
    throw appError_("RESPONSE_LOCKED", "This survey response cannot be edited.");
  }

  let optionId = "";
  let textResponse = "";
  if (type === "choice") {
    optionId = text_(req.optionId || req.option_id);
    if (!optionId) {
      throw appError_("OPTION_REQUIRED", "Choice survey requires an option ID.");
    }
    assertSurveyOption_(surveyId, optionId);
  } else {
    textResponse = text_(req.textResponse || req.text_response);
    if (!textResponse) {
      throw appError_("TEXT_RESPONSE_REQUIRED", "Text survey requires a response.");
    }
  }

  const now = nowString_();
  if (existing) {
    setRecordFields_("SurveyResponses", existing.rowNumber, {
      option_id: optionId,
      text_response: textResponse,
      updated_at: now,
    });
  } else {
    appendRecord_("SurveyResponses", {
      response_id: nextId_("A"),
      survey_id: surveyId,
      student_id: studentId,
      option_id: optionId,
      text_response: textResponse,
      submitted_at: now,
      updated_at: now,
    });
  }

  SpreadsheetApp.flush();
  return studentPayload_(studentId);
}

function addNotice_(req) {
  requireTeacher_(req.token);

  const scope = text_(req.scope || "class").toLowerCase();
  if (["school", "class", "private"].indexOf(scope) === -1) {
    throw appError_("INVALID_SCOPE", "Notice scope must be school, class, or private.");
  }

  const title = text_(req.title);
  const body = text_(req.body);
  if (!title || !body) {
    throw appError_("NOTICE_REQUIRED", "Notice title and body are required.");
  }

  const targetStudentId = text_(req.targetStudentId || req.target_student_id);
  if (scope === "private" && !findStudentRowById_(targetStudentId)) {
    throw appError_("TARGET_STUDENT_REQUIRED", "Private notice requires a valid target student.");
  }

  appendRecord_("Notices", {
    notice_id: nextId_("N"),
    scope,
    target_student_id: scope === "private" ? targetStudentId : "",
    title,
    body,
    publish_at: text_(req.publishAt || req.publish_at) || nowString_(),
    expires_at: text_(req.expiresAt || req.expires_at),
    is_active: req.isActive === undefined && req.is_active === undefined ? true : isTruthy_(req.isActive || req.is_active),
    created_by: "teacher",
  });

  SpreadsheetApp.flush();
  return teacherPayload_();
}

function addPoints_(req) {
  requireTeacher_(req.token);

  const studentId = text_(req.studentId || req.student_id);
  if (!findStudentRowById_(studentId)) {
    throw appError_("STUDENT_NOT_FOUND", "Student was not found.");
  }

  const amount = toNumber_(req.pointsDelta || req.points_delta || req.amount);
  const reason = text_(req.reason);
  if (!reason || amount === 0) {
    throw appError_("POINT_LOG_REQUIRED", "Point reason and non-zero amount are required.");
  }

  appendRecord_("PointLogs", {
    log_id: nextId_("P"),
    student_id: studentId,
    reason,
    points_delta: amount,
    source: text_(req.source || "teacher"),
    created_at: text_(req.createdAt || req.created_at) || nowString_(),
    created_by: "teacher",
    memo: text_(req.memo),
  });

  SpreadsheetApp.flush();
  return teacherPayload_();
}

function updateStudentTitle_(req) {
  requireTeacher_(req.token);

  const studentId = text_(req.studentId || req.student_id);
  const title = text_(req.title);
  const row = findStudentRowById_(studentId);
  if (!row) {
    throw appError_("STUDENT_NOT_FOUND", "Student was not found.");
  }
  if (!title) {
    throw appError_("TITLE_REQUIRED", "Student title is required.");
  }

  setRecordFields_("Students", row.rowNumber, { title });
  SpreadsheetApp.flush();
  return teacherPayload_();
}

function createSurvey_(req) {
  requireTeacher_(req.token);

  const type = text_(req.type || "choice").toLowerCase() === "text" ? "text" : "choice";
  const question = text_(req.question);
  if (!question) {
    throw appError_("QUESTION_REQUIRED", "Survey question is required.");
  }

  const surveyId = nextId_("SV");
  appendRecord_("Surveys", {
    survey_id: surveyId,
    type,
    question,
    status: text_(req.status || "open").toLowerCase(),
    opens_at: text_(req.opensAt || req.opens_at) || nowString_(),
    closes_at: text_(req.closesAt || req.closes_at),
    allow_edit: req.allowEdit === undefined && req.allow_edit === undefined ? true : isTruthy_(req.allowEdit || req.allow_edit),
    created_by: "teacher",
    created_at: nowString_(),
  });

  if (type === "choice") {
    const options = parseOptions_(req.options);
    if (options.length < 2) {
      throw appError_("OPTIONS_REQUIRED", "Choice survey requires at least two options.");
    }
    options.forEach((optionText, index) => {
      appendRecord_("SurveyOptions", {
        option_id: nextId_("O"),
        survey_id: surveyId,
        option_order: index + 1,
        option_text: optionText,
        active: true,
      });
    });
  }

  SpreadsheetApp.flush();
  return teacherPayload_();
}

function updateClassGoal_(req) {
  requireTeacher_(req.token);

  const goalId = text_(req.goalId || req.goal_id || "G001");
  const title = text_(req.title);
  const targetPoints = toNumber_(req.targetPoints || req.target_points);
  const rewardName = text_(req.rewardName || req.reward_name);
  const hasCurrentPoints = req.currentPoints !== undefined || req.current_points !== undefined;
  const activeValue =
    req.active === undefined && req.isActive === undefined && req.is_active === undefined
      ? true
      : isTruthy_(req.active || req.isActive || req.is_active);

  if (!title || targetPoints < 1) {
    throw appError_("CLASS_GOAL_REQUIRED", "Class goal title and target points are required.");
  }

  const fields = {
    goal_id: goalId,
    title,
    target_points: targetPoints,
    reward_name: rewardName,
    status: text_(req.status || "open").toLowerCase(),
    active: activeValue,
    updated_at: nowString_(),
  };
  if (hasCurrentPoints) {
    fields.current_points = toNumber_(req.currentPoints || req.current_points);
  }
  if (req.memo !== undefined) {
    fields.memo = text_(req.memo);
  }

  const existing = findRowByField_("ClassGoals", "goal_id", goalId);
  if (existing) {
    setRecordFields_("ClassGoals", existing.rowNumber, fields);
  } else {
    if (!hasCurrentPoints) {
      fields.current_points = "";
    }
    if (fields.memo === undefined) {
      fields.memo = "";
    }
    appendRecord_("ClassGoals", fields);
  }

  SpreadsheetApp.flush();
  return teacherPayload_();
}

function logout_(req) {
  const token = text_(req.token);
  if (token) {
    CacheService.getScriptCache().remove(sessionKey_(token));
    PropertiesService.getScriptProperties().deleteProperty(sessionKey_(token));
  }
  return { loggedOut: true };
}

function studentPayload_(studentId) {
  const row = findStudentRowById_(studentId);
  if (!row) {
    throw appError_("STUDENT_NOT_FOUND", "Student was not found.");
  }

  return {
    settings: publicSettings_(),
    student: studentForStudent_(row.record),
    notices: visibleNoticesForStudent_(studentId),
    pointHistory: pointHistoryForStudent_(studentId),
    surveys: surveysForStudent_(studentId),
    leaderboard: leaderboard_(),
    classGoal: classGoal_(),
    avatarItems: avatarItems_(),
    rewards: rewards_(),
  };
}

function teacherPayload_() {
  return {
    settings: publicSettings_(),
    students: studentRows_().map((row) => studentForTeacher_(row.record)),
    notices: notices_(false),
    pointLogs: pointLogs_(),
    pointRules: pointRules_(),
    surveys: surveySummariesForTeacher_(),
    surveyOptions: surveyOptions_(),
    surveyResponses: surveyResponses_(),
    classGoal: classGoal_(),
    avatarItems: avatarItems_(),
    rewards: rewards_(),
  };
}

function visibleNoticesForStudent_(studentId) {
  return notices_(true).filter((notice) => {
    if (notice.scope === "private") {
      return notice.targetStudentId === studentId;
    }
    return notice.scope === "school" || notice.scope === "class";
  });
}

function notices_(activeOnly) {
  return table_("Notices").rows
    .filter((row) => !activeOnly || isTruthy_(row.record.is_active))
    .filter((row) => !activeOnly || isWithinDateWindow_(row.record.publish_at, row.record.expires_at))
    .map((row) => ({
      noticeId: rowText_(row, "notice_id"),
      scope: text_(row.record.scope),
      targetStudentId: text_(row.record.target_student_id),
      title: text_(row.record.title),
      body: text_(row.record.body),
      publishAt: displayDate_(row.record.publish_at),
      expiresAt: displayDate_(row.record.expires_at),
      isActive: isTruthy_(row.record.is_active),
      createdBy: text_(row.record.created_by),
    }))
    .sort((a, b) => compareDesc_(a.publishAt, b.publishAt));
}

function pointHistoryForStudent_(studentId) {
  return pointLogs_()
    .filter((log) => log.studentId === studentId)
    .sort((a, b) => compareDesc_(a.createdAt, b.createdAt))
    .slice(0, 30);
}

function pointLogs_() {
  return table_("PointLogs").rows.map((row) => ({
    logId: rowText_(row, "log_id"),
    studentId: rowText_(row, "student_id"),
    reason: text_(row.record.reason),
    pointsDelta: toNumber_(row.record.points_delta),
    source: text_(row.record.source),
    createdAt: displayDate_(row.record.created_at),
    createdBy: text_(row.record.created_by),
    memo: text_(row.record.memo),
  }));
}

function pointRules_() {
  return table_("PointRules").rows.map((row) => ({
    ruleId: rowText_(row, "rule_id"),
    category: text_(row.record.category),
    reason: text_(row.record.reason),
    defaultPoints: toNumber_(row.record.default_points),
    active: isTruthy_(row.record.active),
    memo: text_(row.record.memo),
  }));
}

function surveysForStudent_(studentId) {
  const options = surveyOptions_();
  const responses = surveyResponses_();
  return table_("Surveys").rows
    .filter((row) => text_(row.record.status).toLowerCase() === "open")
    .filter((row) => isWithinDateWindow_(row.record.opens_at, row.record.closes_at))
    .map((row) => {
      const surveyId = rowText_(row, "survey_id");
      const type = text_(row.record.type).toLowerCase() === "text" ? "text" : "choice";
      const surveyOptions = options.filter((option) => option.surveyId === surveyId && option.active);
      const surveyResponses = responses.filter((response) => response.surveyId === surveyId);
      const myResponse = surveyResponses.find((response) => response.studentId === studentId);
      const payload = {
        surveyId,
        type,
        question: text_(row.record.question),
        status: text_(row.record.status),
        opensAt: displayDate_(row.record.opens_at),
        closesAt: displayDate_(row.record.closes_at),
        allowEdit: isTruthy_(row.record.allow_edit),
        responseCount: surveyResponses.length,
      };

      if (type === "choice") {
        payload.options = surveyOptions.map((option) => ({
          optionId: option.optionId,
          optionText: option.optionText,
          count: surveyResponses.filter((response) => response.optionId === option.optionId).length,
        }));
        payload.selectedOptionId = myResponse ? myResponse.optionId : "";
      } else {
        payload.textResponse = myResponse ? myResponse.textResponse : "";
      }
      return payload;
    })
    .sort((a, b) => compareDesc_(a.opensAt, b.opensAt));
}

function surveySummariesForTeacher_() {
  const options = surveyOptions_();
  const responses = surveyResponses_();
  return table_("Surveys").rows.map((row) => {
    const surveyId = rowText_(row, "survey_id");
    const type = text_(row.record.type).toLowerCase() === "text" ? "text" : "choice";
    const surveyResponses = responses.filter((response) => response.surveyId === surveyId);
    const payload = {
      surveyId,
      type,
      question: text_(row.record.question),
      status: text_(row.record.status),
      opensAt: displayDate_(row.record.opens_at),
      closesAt: displayDate_(row.record.closes_at),
      allowEdit: isTruthy_(row.record.allow_edit),
      createdBy: text_(row.record.created_by),
      createdAt: displayDate_(row.record.created_at),
      responseCount: surveyResponses.length,
    };
    if (type === "choice") {
      payload.options = options
        .filter((option) => option.surveyId === surveyId)
        .map((option) => ({
          optionId: option.optionId,
          optionText: option.optionText,
          active: option.active,
          count: surveyResponses.filter((response) => response.optionId === option.optionId).length,
        }));
    } else {
      payload.responses = surveyResponses
        .filter((response) => response.textResponse)
        .map((response) => ({
          studentId: response.studentId,
          studentName: studentNameById_(response.studentId),
          textResponse: response.textResponse,
          updatedAt: response.updatedAt,
        }));
    }
    return payload;
  });
}

function surveyOptions_() {
  return table_("SurveyOptions").rows
    .map((row) => ({
      optionId: rowText_(row, "option_id"),
      surveyId: rowText_(row, "survey_id"),
      optionOrder: toNumber_(row.record.option_order),
      optionText: text_(row.record.option_text),
      active: isTruthy_(row.record.active),
    }))
    .sort((a, b) => a.optionOrder - b.optionOrder);
}

function surveyResponses_() {
  return table_("SurveyResponses").rows.map((row) => ({
    responseId: rowText_(row, "response_id"),
    surveyId: rowText_(row, "survey_id"),
    studentId: rowText_(row, "student_id"),
    optionId: rowText_(row, "option_id"),
    textResponse: text_(row.record.text_response),
    submittedAt: displayDate_(row.record.submitted_at),
    updatedAt: displayDate_(row.record.updated_at),
  }));
}

function avatarItems_() {
  return table_("AvatarItems").rows.map((row) => ({
    itemId: rowText_(row, "item_id"),
    category: text_(row.record.category),
    name: text_(row.record.name),
    unlockPoints: toNumber_(row.record.unlock_points),
    assetKey: text_(row.record.asset_key),
    description: text_(row.record.description),
    active: isTruthy_(row.record.active),
  }));
}

function rewards_() {
  return table_("Rewards").rows
    .map((row) => ({
      rewardId: rowText_(row, "reward_id"),
      thresholdPoints: toNumber_(row.record.threshold_points),
      rewardType: text_(row.record.reward_type),
      rewardName: text_(row.record.reward_name),
      description: text_(row.record.description),
      active: isTruthy_(row.record.active),
    }))
    .sort((a, b) => a.thresholdPoints - b.thresholdPoints);
}

function classGoal_() {
  const row = table_("ClassGoals").rows.find((entry) => {
    const status = text_(entry.record.status || "open").toLowerCase();
    return isTruthy_(entry.record.active) && status !== "closed";
  });
  if (!row) {
    return null;
  }

  const targetPoints = toNumber_(row.record.target_points);
  const currentPoints = text_(row.record.current_points)
    ? toNumber_(row.record.current_points)
    : totalClassPoints_();
  const progress = targetPoints ? Math.round((currentPoints / targetPoints) * 100) : 0;

  return {
    goalId: rowText_(row, "goal_id"),
    title: text_(row.record.title),
    targetPoints,
    currentPoints,
    progress: Math.max(0, Math.min(progress, 100)),
    remainingPoints: Math.max(targetPoints - currentPoints, 0),
    rewardName: text_(row.record.reward_name),
    status: text_(row.record.status || "open"),
    active: isTruthy_(row.record.active),
    updatedAt: displayDate_(row.record.updated_at),
    memo: text_(row.record.memo),
  };
}

function totalClassPoints_() {
  return activeStudentRows_().reduce((sum, row) => sum + totalPoints_(row.record), 0);
}

function leaderboard_() {
  return activeStudentRows_()
    .map((row) => studentForStudent_(row.record))
    .sort((a, b) => b.points - a.points || a.number - b.number)
    .map((student) => {
      student.rank = rankByStudent_()[student.studentId] || student.rank;
      return student;
    });
}

function studentForStudent_(record) {
  const studentId = text_(record.student_id);
  const points = totalPoints_(record);
  return {
    studentId,
    number: toNumber_(record.number),
    name: text_(record.name),
    active: isTruthy_(record.active),
    points,
    rank: rankByStudent_()[studentId] || 0,
    level: levelForPoints_(points),
    title: text_(record.title),
    avatar: {
      baseId: text_(record.avatar_base_id || "boy"),
      clothingItemId: text_(record.clothing_item_id || "basic"),
      backgroundItemId: text_(record.background_item_id || "basic-bg"),
    },
  };
}

function studentForTeacher_(record) {
  const student = studentForStudent_(record);
  student.startingPoints = toNumber_(record.starting_points);
  student.pointDelta = pointDeltaForStudent_(student.studentId);
  student.memo = text_(record.memo);
  return student;
}

function publicStudent_(record) {
  return {
    studentId: text_(record.student_id),
    number: toNumber_(record.number),
    name: text_(record.name),
  };
}

function settings_() {
  const out = {};
  table_("Settings").rows.forEach((row) => {
    const key = rowText_(row, "key");
    if (key) {
      out[key] = rowText_(row, "value");
    }
  });
  return out;
}

function publicSettings_() {
  const settings = settings_();
  return {
    appName: text_(settings.app_name || "Classroom HQ"),
    schoolYear: text_(settings.school_year),
    semester: text_(settings.semester),
    className: text_(settings.class_name),
    timezone: text_(settings.timezone || DEFAULT_TIMEZONE),
  };
}

function timezone_() {
  try {
    const settings = settings_();
    return text_(settings.timezone) || Session.getScriptTimeZone() || DEFAULT_TIMEZONE;
  } catch (error) {
    return Session.getScriptTimeZone() || DEFAULT_TIMEZONE;
  }
}

function totalPoints_(record) {
  const studentId = text_(record.student_id);
  if (studentId) {
    return toNumber_(record.starting_points) + pointDeltaForStudent_(studentId);
  }
  return toNumber_(record.total_points || record.starting_points || 0);
}

function pointDeltaForStudent_(studentId) {
  return pointDeltaByStudent_()[text_(studentId)] || 0;
}

function pointDeltaByStudent_() {
  if (requestCache_.pointDeltas) {
    return requestCache_.pointDeltas;
  }

  const deltas = {};
  pointLogs_().forEach((log) => {
    if (!log.studentId) return;
    deltas[log.studentId] = (deltas[log.studentId] || 0) + log.pointsDelta;
  });
  requestCache_.pointDeltas = deltas;
  return deltas;
}

function rankByStudent_() {
  if (requestCache_.ranks) {
    return requestCache_.ranks;
  }

  const sorted = activeStudentRows_()
    .map((row) => ({
      studentId: rowText_(row, "student_id"),
      number: toNumber_(row.record.number),
      points: totalPoints_(row.record),
    }))
    .sort((a, b) => b.points - a.points || a.number - b.number);

  const ranks = {};
  let currentRank = 0;
  let previousPoints = null;
  sorted.forEach((student, index) => {
    if (student.points !== previousPoints) {
      currentRank = index + 1;
      previousPoints = student.points;
    }
    ranks[student.studentId] = currentRank;
  });
  requestCache_.ranks = ranks;
  return ranks;
}

function levelForPoints_(points) {
  const value = toNumber_(points);
  if (value >= 180) return "Lv.5";
  if (value >= 150) return "Lv.4";
  if (value >= 100) return "Lv.3";
  if (value >= 50) return "Lv.2";
  return "Lv.1";
}

function activeStudentRows_() {
  return studentRows_().filter((row) => isTruthy_(row.record.active));
}

function studentRows_() {
  return table_("Students").rows;
}

function findStudentForLogin_(login) {
  return activeStudentRows_().find((row) => {
    return (
      rowText_(row, "student_id") === login ||
      rowText_(row, "number") === login ||
      rowText_(row, "name") === login
    );
  });
}

function findStudentRowById_(studentId) {
  const id = text_(studentId);
  if (!id) {
    return null;
  }
  return studentRows_().find((row) => rowText_(row, "student_id") === id) || null;
}

function studentNameById_(studentId) {
  const row = findStudentRowById_(studentId);
  return row ? text_(row.record.name) : studentId;
}

function findSurveyResponse_(surveyId, studentId) {
  return table_("SurveyResponses").rows.find((row) => {
    return rowText_(row, "survey_id") === surveyId && rowText_(row, "student_id") === studentId;
  }) || null;
}

function assertSurveyOption_(surveyId, optionId) {
  const option = table_("SurveyOptions").rows.find((row) => {
    return rowText_(row, "survey_id") === surveyId && rowText_(row, "option_id") === optionId && isTruthy_(row.record.active);
  });
  if (!option) {
    throw appError_("INVALID_OPTION", "Survey option is invalid.");
  }
}

function assertAvatarChoice_(itemId, category, points) {
  const item = avatarItems_().find((entry) => entry.itemId === itemId && entry.category === category && entry.active);
  if (!item) {
    throw appError_("INVALID_AVATAR_ITEM", `Invalid avatar ${category}: ${itemId}`);
  }
  if (item.unlockPoints > points) {
    throw appError_("AVATAR_ITEM_LOCKED", `${item.name} requires ${item.unlockPoints} points.`);
  }
}

function parseOptions_(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => text_(entry)).filter(Boolean);
  }
  return text_(value)
    .split(/\r?\n|,/)
    .map((entry) => text_(entry))
    .filter(Boolean);
}

function createSession_(type, subjectId) {
  const token = `${Utilities.getUuid()}-${Utilities.getUuid()}`.replace(/-/g, "");
  const payload = {
    type,
    subjectId,
    createdAt: nowString_(),
    lastSeenAt: nowString_(),
  };
  saveSession_(token, payload);
  return token;
}

function requireStudent_(token) {
  const session = requireSession_(token, "student");
  const row = findStudentRowById_(session.subjectId);
  if (!row || !isTruthy_(row.record.active)) {
    throw appError_("STUDENT_SESSION_INVALID", "Student session is no longer valid.");
  }
  return {
    session,
    studentId: session.subjectId,
    row,
  };
}

function requireTeacher_(token) {
  return requireSession_(token, "teacher");
}

function requireSession_(token, type) {
  const cleanToken = text_(token);
  if (!cleanToken) {
    throw appError_("AUTH_REQUIRED", "Login token is required.");
  }
  const cached = CacheService.getScriptCache().get(sessionKey_(cleanToken));
  let session = cached ? JSON.parse(cached) : null;
  if (!session) {
    const stored = PropertiesService.getScriptProperties().getProperty(sessionKey_(cleanToken));
    if (stored) {
      session = JSON.parse(stored);
    }
  }
  if (!session) {
    throw appError_("SESSION_EXPIRED", "Login session expired. Please log in again.");
  }
  if (session.type !== type) {
    throw appError_("FORBIDDEN", "This action is not allowed for the current session.");
  }
  session.lastSeenAt = nowString_();
  saveSession_(cleanToken, session);
  return session;
}

function saveSession_(token, session) {
  const key = sessionKey_(token);
  const payload = JSON.stringify(session);
  CacheService.getScriptCache().put(key, payload, SESSION_TTL_SECONDS);
  PropertiesService.getScriptProperties().setProperty(key, payload);
}

function sessionKey_(token) {
  return `classroom-hq-session:${token}`;
}

function table_(sheetName) {
  if (!requestCache_.tables) {
    requestCache_.tables = {};
  }
  if (requestCache_.tables[sheetName]) {
    return requestCache_.tables[sheetName];
  }

  const sheet = sheet_(sheetName);
  const lastColumn = sheet.getLastColumn();
  if (lastColumn < 1) {
    throw appError_("EMPTY_SHEET", `Sheet is empty: ${sheetName}`);
  }

  const rawHeaderRow = sheet.getRange(HEADER_ROW, 1, 1, lastColumn).getDisplayValues()[0].map((header) => text_(header));
  let columnCount = rawHeaderRow.length;
  while (columnCount > 0 && !rawHeaderRow[columnCount - 1]) {
    columnCount -= 1;
  }
  if (columnCount === 0) {
    throw appError_("HEADER_NOT_FOUND", `Header row was not found in sheet: ${sheetName}`);
  }

  const headers = rawHeaderRow.slice(0, columnCount);
  const lastRow = sheet.getLastRow();
  const rows = [];
  if (lastRow >= FIRST_DATA_ROW) {
    const rowCount = lastRow - HEADER_ROW;
    const rawValues = sheet.getRange(FIRST_DATA_ROW, 1, rowCount, columnCount).getValues();
    const displayValues = sheet.getRange(FIRST_DATA_ROW, 1, rowCount, columnCount).getDisplayValues();
    rawValues.forEach((values, index) => {
      if (!text_(displayValues[index][0] || values[0])) {
        return;
      }
      rows.push({
        rowNumber: FIRST_DATA_ROW + index,
        record: recordFromValues_(headers, values),
        displayRecord: recordFromValues_(headers, displayValues[index]),
      });
    });
  }

  const table = {
    sheet,
    headers,
    rows,
  };
  requestCache_.tables[sheetName] = table;
  return table;
}

function recordFromValues_(headers, values) {
  const record = {};
  headers.forEach((header, index) => {
    record[header] = values[index];
  });
  return record;
}

function appendRecord_(sheetName, record) {
  const table = table_(sheetName);
  const rowValues = table.headers.map((header) => {
    if (Object.prototype.hasOwnProperty.call(record, header)) {
      return record[header];
    }
    return "";
  });
  const nextRow = Math.max(table.sheet.getLastRow() + 1, FIRST_DATA_ROW);
  table.sheet.getRange(nextRow, 1, 1, table.headers.length).setValues([rowValues]);
  clearTableCache_(sheetName);
  return nextRow;
}

function setRecordFields_(sheetName, rowNumber, fields) {
  const table = table_(sheetName);
  Object.keys(fields).forEach((fieldName) => {
    const columnIndex = table.headers.indexOf(fieldName);
    if (columnIndex === -1) {
      throw appError_("FIELD_NOT_FOUND", `Field was not found: ${sheetName}.${fieldName}`);
    }
    table.sheet.getRange(rowNumber, columnIndex + 1).setValue(fields[fieldName]);
  });
  clearTableCache_(sheetName);
}

function clearTableCache_(sheetName) {
  if (requestCache_.tables) {
    delete requestCache_.tables[sheetName];
  }
  if (sheetName === "PointLogs" || sheetName === "Students") {
    requestCache_.pointDeltas = null;
    requestCache_.ranks = null;
  }
}

function findRowByField_(sheetName, fieldName, value) {
  const target = text_(value);
  return table_(sheetName).rows.find((row) => rowText_(row, fieldName) === target) || null;
}

function nextId_(prefix) {
  const cleanPrefix = text_(prefix);
  if (!cleanPrefix) {
    throw appError_("ID_PREFIX_REQUIRED", "ID prefix is required.");
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const props = PropertiesService.getScriptProperties();
    const key = `classroom-hq-next-id:${cleanPrefix}`;
    const current = Math.max(toNumber_(props.getProperty(key)), latestIdNumber_(cleanPrefix));
    const next = current + 1;
    props.setProperty(key, String(next));
    return `${cleanPrefix}${String(next).padStart(3, "0")}`;
  } finally {
    lock.releaseLock();
  }
}

function latestIdNumber_(prefix) {
  const pattern = new RegExp(`^${escapeRegExp_(prefix)}(\\d+)$`);
  let max = 0;

  ss_().getSheets().forEach((sheet) => {
    const lastRow = sheet.getLastRow();
    if (lastRow < FIRST_DATA_ROW) {
      return;
    }

    const values = sheet.getRange(FIRST_DATA_ROW, 1, lastRow - HEADER_ROW, 1).getDisplayValues();
    values.forEach(([value]) => {
      const match = text_(value).match(pattern);
      if (match) {
        max = Math.max(max, Number(match[1]));
      }
    });
  });

  return max;
}

function escapeRegExp_(value) {
  return text_(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sheet_(name) {
  const sheet = ss_().getSheetByName(name);
  if (!sheet) {
    throw appError_("SHEET_NOT_FOUND", `Sheet was not found: ${name}`);
  }
  return sheet;
}

function ss_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function isWithinDateWindow_(startValue, endValue) {
  const now = new Date();
  const start = parseDate_(startValue);
  const end = parseDate_(endValue);
  if (start && now < start) {
    return false;
  }
  if (end && now > end) {
    return false;
  }
  return true;
}

function parseDate_(value) {
  if (!value) {
    return null;
  }
  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value.getTime())) {
    return value;
  }

  const raw = text_(value);
  if (!raw) {
    return null;
  }

  const match = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{1,2}))?/);
  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4] || 0),
      Number(match[5] || 0),
      0,
    );
  }

  const parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function displayDate_(value) {
  if (!value) {
    return "";
  }
  const date = parseDate_(value);
  if (!date) {
    return text_(value);
  }
  return Utilities.formatDate(date, timezone_(), "yyyy-MM-dd HH:mm");
}

function nowString_() {
  return Utilities.formatDate(new Date(), timezone_(), "yyyy-MM-dd HH:mm");
}

function compareDesc_(a, b) {
  const dateA = parseDate_(a);
  const dateB = parseDate_(b);
  if (dateA && dateB) {
    return dateB.getTime() - dateA.getTime();
  }
  return text_(b).localeCompare(text_(a));
}

function rowText_(row, fieldName) {
  if (row.displayRecord && row.displayRecord[fieldName] !== undefined && text_(row.displayRecord[fieldName]) !== "") {
    return text_(row.displayRecord[fieldName]);
  }
  return text_(row.record[fieldName]);
}

function text_(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
}

function toNumber_(value) {
  if (typeof value === "number" && !isNaN(value)) {
    return value;
  }
  const parsed = Number(text_(value).replace(/,/g, ""));
  return isNaN(parsed) ? 0 : parsed;
}

function isTruthy_(value) {
  if (value === true) {
    return true;
  }
  if (value === false || value === null || value === undefined) {
    return false;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  const normalized = text_(value).toUpperCase();
  return ["Y", "YES", "TRUE", "1", "ON"].indexOf(normalized) !== -1;
}

function appError_(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
