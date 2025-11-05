import {
  graphql,
  formatPageQuery,
  formatPageQueryWithCount,
  formatMutation,
  decodeId
} from "@openimis/fe-core";

export function fetchNotice(mm, uuid) {
  let projections = [
    "uuid", "title", "description",
    "healthFacility{id name}", "createdAt", "updatedAt", "isActive"
  ];
  const payload = formatPageQuery("notices", [`uuid: "${uuid}"`], projections);
  return graphql(payload, "GET_NOTICE");
}

export function fetchNotices(mm, prms) {
  $(!!prms.title_Icontains ? `"title_Icontains": "${prms.title_Icontains}"` : "");
  const payload = formatPageQueryWithCount(
    "notices",
    prms,
    [
      "id",
      "uuid",
      "title",
      "description",
      "priority",
      "healthFacility {id code name }",
      "createdAt",
      "updatedAt",
      "isActive",
      "attachmentCount"
    ]
  );
  return graphql(payload, "FETCH_NOTICES");
}

export function getNotice(mm, notice_uuid) {
  var filters = [];
  filters.push(`uuid:"${notice_uuid}"`);
  var projections = [
    "id",
    "uuid",
    "title",
    "description",
    "healthFacility {id code name }",
    "createdAt",
    "priority",
    "updatedAt",
    "isActive"
  ];
  const payload = formatPageQuery(
    "notices",
    filters,
    projections
  );
  return graphql(
    payload,
    "GET_NOTICE"
  );
}

export function createNotice(mm, notice, clientMutationLabel, clientMutationDetails = null) {
  let noticeGQL = `
    title: "${notice.title}"
    description: "${notice.description}"
    priority: "${notice.priority}"
    healthFacilityId: ${notice.healthFacility ? decodeId(notice.healthFacility.id) : null}  
    ${notice.uuid ? `uuid: "${notice.uuid}"` : ''}  
    schedulePublish: ${notice.schedulePublish !== undefined ? notice.schedulePublish : false}
    ${notice.publishStartDate ? `publishStartDate: "${notice.publishStartDate.toISOString()}"` : ''}
  `;

  let mutation = formatMutation("createNotice", noticeGQL, clientMutationLabel, clientMutationDetails);
  var requestedDateTime = new Date();

  return graphql(
    mutation.payload,
    ['NOTICE_MUTATION_REQ', 'NOTICE_MUTATION_RESP', 'NOTICE_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      clientMutationDetails: clientMutationDetails ? JSON.stringify(clientMutationDetails) : null,
      requestedDateTime
    }
  );
}

export function updateNotice(mm, notice, clientMutationLabel, clientMutationDetails = null) {

  let noticeGQL = `
    uuid: "${notice.uuid}"
    title: "${notice.title}"
    description: "${notice.description}"
    priority: "${notice.priority}"
    healthFacilityId: ${notice.healthFacility ? decodeId(notice.healthFacility.id) : null}
    schedulePublish: ${notice.schedulePublish !== undefined ? notice.schedulePublish : false}
    ${notice.publishStartDate ? `publishStartDate: "${notice.publishStartDate.toISOString()}"` : ''}
  `;

  let mutation = formatMutation("updateNotice", noticeGQL, clientMutationLabel, clientMutationDetails);
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ['NOTICE_MUTATION_REQ', 'NOTICE_UPDATE_RESP', 'NOTICE_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      clientMutationDetails: !!clientMutationDetails ? JSON.stringify(clientMutationDetails) : null,
      requestedDateTime
    }
  );
}
export function toggleNoticeStatus(mm, noticeId, isActive, clientMutationLabel = "Toggle Notice Status") {
  let toggleGQL = `
    uuid: "${noticeId}"
    isActive: ${isActive}
  `;
  let mutation = formatMutation("toggleNoticeStatus", toggleGQL, clientMutationLabel);
  return graphql(mutation.payload, ['NOTICE_TOGGLE_STATUS_REQ', 'NOTICE_TOGGLE_STATUS_RESP', 'NOTICE_TOGGLE_STATUS_ERR'], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    uuid: noticeId, 
    isActive,       
    requestedDateTime: new Date(),
  });
}

export function sendNoticeEmail(mm, noticeId, clientMutationLabel = "Send Notice Email", clientMutationDetails = null) {
  let emailGQL = `uuid: "${noticeId}"`;
  let mutation = formatMutation("sendNoticeEmail", emailGQL, clientMutationLabel);
  return graphql(mutation.payload, ['NOTICE_EMAIL_REQ', 'NOTICE_EMAIL_RESP', 'NOTICE_EMAIL_ERR'], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    clientMutationDetails,
    requestedDateTime: new Date(),
  });
}

export function sendNoticeSMS(mm, noticeId, clientMutationLabel = "Send Notice SMS", clientMutationDetails = null) {
  let smsGQL = `uuid: "${noticeId}"`;
  let mutation = formatMutation("sendNoticeSms", smsGQL, clientMutationLabel);
  return graphql(mutation.payload, ['NOTICE_SMS_REQ', 'NOTICE_SMS_RESP', 'NOTICE_SMS_ERR'], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    clientMutationDetails,
    requestedDateTime: new Date(),
  });
}

const NOTICE_ATTACHMENTS_FULL_PROJECTION = () => [
  "id",
  "generalType:generalType",
  "type",
  "title",
  "date",
  "filename",
  "mime",
  "url",
  "doc",
];


export function fetchNoticeAttachments(notice) {
  const payload = formatPageQueryWithCount(
    "noticeAttachments",
    [`notice_Uuid: "${notice.uuid}"`],
    NOTICE_ATTACHMENTS_FULL_PROJECTION()
  );
  return graphql(payload, 'NOTICE_ATTACHMENTS');
}

export function downloadAttachment(attachment) {
  const payload = `
    mutation downloadAttachment {
      downloadAttachment(input: { uuid: "${attachment.uuid}" }) {
        attachment {
          document
          filename
        }
      }
    }
  `;
  return graphql(payload, null, null, null, { skipDispatch: true }).then((response) => {
    const { document, filename } = response.data.downloadAttachment.attachment;
    const decodedData = atob(document);
    const byteNumbers = new Array(decodedData.length);
    for (let i = 0; i < decodedData.length; i++) {
      byteNumbers[i] = decodedData.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: attachment.mime });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  });
}

export function deleteAttachment(attachment, clientMutationLabel) {
  const payload = `
    ${!!attachment?.id ? `id: "${attachment.id}"` : ""}
  `;

  const mutation = formatMutation("deleteNoticeAttachment", payload, clientMutationLabel);

  const requestedDateTime = new Date();

  return graphql(
    mutation.payload,
    [
      "DELETE_NOTICE_ATTACHMENT_REQUEST",
      "DELETE_NOTICE_ATTACHMENT_SUCCESS",
      "DELETE_NOTICE_ATTACHMENT_FAILURE",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      mutationLog: { clientMutationLabel },
    }
  );
}
export function createAttachment(attachment, clientMutationLabel) {
  const payload = `
    ${!!attachment.noticeUuid ? `noticeUuid: "${attachment.noticeUuid}"` : ""}
    ${!!attachment.generalType ? `generalType: "${attachment.generalType}"` : ""}
    ${!!attachment.type ? `type: "${attachment.type}"` : ""}
    ${!!attachment.title ? `title: "${attachment.title}"` : ""}
    ${!!attachment.date ? `date: "${attachment.date}"` : ""}
    ${!!attachment.filename ? `filename: "${attachment.filename}"` : ""}
    ${!!attachment.mime ? `mime: "${attachment.mime}"` : ""}
    ${!!attachment.url ? `url: "${attachment.url}"` : ""}
    ${!!attachment.document ? `document: "${attachment.document}"` : ""}
  `;


  const mutation = formatMutation("createNoticeAttachment", payload, clientMutationLabel); // Fix mutation name

  const requestedDateTime = new Date();

  return graphql(
    mutation.payload,
    ["NOTICE_MUTATION_REQ", "CREATE_NOTICE_ATTACHMENT_RESP", "NOTICE_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}
export function updateAttachment(attachment, message) {
  const payload = formatMutation(
    "updateNoticeAttachment",
    {
      uuid: attachment.uuid,
      generalType: attachment.generalType,
      type: attachment.type,
      title: attachment.title,
      date: attachment.date,
      filename: attachment.filename,
      mime: attachment.mime,
      url: attachment.url,
      document: attachment.document,
    },
    NOTICE_ATTACHMENTS_FULL_PROJECTION()
  );
  return graphql(payload, "NOTICE_MUTATION_REQ", "UPDATE_NOTICE_ATTACHMENT_SUCCESS", "UPDATE_NOTICE_ATTACHMENT_FAILURE", { mutationLog: { message } });
}


export function fetchRequestLogs(mm, prms) {
  const payload = formatPageQueryWithCount(
    "requestLogs",
    prms,
    [
      "id",
      "timestamp",
      "appName",
      "method",
      "path",
      "routeName",
      "statusCode",
      "durationMs",
      "requestData",
      "responseData",
      "statusCode",
      "user",
    ]
  );
  return graphql(payload, "FETCH_REQUEST_LOGS");
}