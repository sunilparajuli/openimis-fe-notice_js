import {
  parseData, dispatchMutationReq, dispatchMutationResp, dispatchMutationErr,
  pageInfo, formatServerError, formatGraphQLError
} from '@openimis/fe-core';

function reducer(
  state = {
    mutation: {},
    submittingMutation: false,
    fetchingNotices: false,
    errorNotices: null,
    fetchedNotices: false,
    notices: [],
    noticesPageInfo: { totalCount: 0 },
    fetchingNotice: false,
    errorNotice: null,
    fetchedNotice: false,
    notice: null,
    errorMutation: null,
    fetchingNoticeAttachments: false,
    fetchedNoticeAttachments: false,
    noticeAttachments: [],
    errorNoticeAttachments: null,

    fetchingRequestLogs: false,
    fetchedRequestLogs: false,
    requestLogs: [],
    requestLogsPageInfo: { totalCount: 0 },
    errorRequestLogs: null,
  },
  action,
) {
  switch (action.type) {
    case "FETCH_NOTICES_REQ":
      return {
        ...state,
        fetchingNotices: true,
        fetchedNotices: false,
        notices: [],
        noticesPageInfo: { totalCount: 0 },
        errorNotices: null,
      };
    case "FETCH_NOTICES_RESP":
      var notices = parseData(action.payload.data.notices);
      var pageinfos = pageInfo(action.payload.data.notices);
      console.log("pageinfos", pageinfos);
      return {
        ...state,
        fetchingNotices: false,
        fetchedNotices: true,
        notices: notices,
        noticesPageInfo: pageInfo(action.payload.data.notices),
        errorNotices: formatGraphQLError(action.payload),
      };
    case "FETCH_NOTICES_ERR":
      return {
        ...state,
        errorNotices: formatServerError(action.payload),
      };

    case "GET_NOTICE_REQ":
      return {
        ...state,
        fetchingNotice: true,
        fetchedNotice: false,
        errorNotice: null,
      };
    case "GET_NOTICE_RESP":
      var notices = parseData(action.payload.data.notices);
      const fetchedNotice = notices && notices.length > 0 ? notices[0] : null;
      return {
        ...state,
        fetchingNotice: false,
        fetchedNotice: true,
        notice: fetchedNotice,
        notices: state.notices.map(notice =>
          notice.uuid.toString() === fetchedNotice?.uuid.toString()
            ? fetchedNotice
            : notice
        ),
        errorNotice: formatGraphQLError(action.payload),
      };
    case "GET_NOTICE_ERR":
      return {
        ...state,
        fetchingNotice: false,
        errorNotice: formatServerError(action.payload),
      };

    case "NOTICE_TOGGLE_STATUS_REQ":
      console.log("Toggle Request Meta:", action.meta);
      return dispatchMutationReq(state, action);
    case "NOTICE_TOGGLE_STATUS_RESP":
      return {
        ...state,
        submittingMutation: false,
        mutation: action.meta,
        errorMutation: formatGraphQLError(action.payload),
      };
    case "NOTICE_TOGGLE_STATUS_ERR":
      return dispatchMutationErr(state, action);

    case "NOTICE_EMAIL_REQ":
      return dispatchMutationReq(state, action);
    case "NOTICE_EMAIL_RESP":
      return {
        ...state,
        submittingMutation: false,
        mutation: action.meta,
        errorMutation: formatGraphQLError(action.payload),
      };
    case "NOTICE_EMAIL_ERR":
      return dispatchMutationErr(state, action);

    case "NOTICE_SMS_REQ":
      return dispatchMutationReq(state, action);
    case "NOTICE_SMS_RESP":
      return {
        ...state,
        submittingMutation: false,
        mutation: action.meta,
        errorMutation: formatGraphQLError(action.payload),
      };
    case "NOTICE_SMS_ERR":
      return dispatchMutationErr(state, action);

    case 'NOTICE_MUTATION_REQ':
      return dispatchMutationReq(state, action);
    case 'NOTICE_MUTATION_RESP':
      return dispatchMutationResp(state, "createNotice", action);
    case 'NOTICE_UPDATE_RESP':
      return dispatchMutationResp(state, "updateNotice", action);
    case 'NOTICE_MUTATION_ERR':
      return dispatchMutationErr(state, action);
    case 'CREATE_NOTICE_ATTACHMENT_RESP':
      return dispatchMutationResp(state, "createNoticeAttachment", action);

    case 'NOTICE_ATTACHMENTS_REQ':
      return {
        ...state,
        fetchingNoticeAttachments: true,
        fetchedNoticeAttachments: false,
        noticeAttachments: [],
        errorNoticeAttachments: null,
      };
    case 'NOTICE_ATTACHMENTS_RESP':
      return {
        ...state,
        fetchingNoticeAttachments: false,
        fetchedNoticeAttachments: true,
        noticeAttachments: parseData(action.payload.data.noticeAttachments),
        errorNoticeAttachments: formatGraphQLError(action.payload),
      };
    case 'NOTICE_ATTACHMENTS_ERR':
      return {
        ...state,
        fetchingNoticeAttachments: false,
        fetchedNoticeAttachments: false,
        errorNoticeAttachments: formatServerError(action.payload),
      };
    case "FETCH_REQUEST_LOGS_REQ":
      return {
        ...state,
        fetchingRequestLogs: true,
        fetchedRequestLogs: false,
        requestLogs: [],
        requestLogsPageInfo: { totalCount: 0 },
        errorRequestLogs: null,
      };
    case "FETCH_REQUEST_LOGS_RESP":
      return {
        ...state,
        fetchingRequestLogs: false,
        fetchedRequestLogs: true,
        requestLogs: parseData(action.payload.data.requestLogs),
        requestLogsPageInfo: pageInfo(action.payload.data.requestLogs),
        errorRequestLogs: formatGraphQLError(action.payload),
      };
    case "FETCH_REQUEST_LOGS_ERR":
      return {
        ...state,
        fetchingRequestLogs: false,
        errorRequestLogs: formatServerError(action.payload),
      };
    default:
      return state;
  }
}

export default reducer;