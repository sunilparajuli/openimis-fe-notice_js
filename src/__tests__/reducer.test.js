import reducer from '../reducer';

jest.mock('@openimis/fe-core', () => ({
  parseData: jest.fn(data => data.edges ? data.edges.map(e => e.node) : []),
  pageInfo: jest.fn(data => data.pageInfo),
  formatServerError: jest.fn(err => err),
  formatGraphQLError: jest.fn(err => err),
  dispatchMutationReq: jest.fn((state, action) => ({ ...state, submittingMutation: true })),
  dispatchMutationResp: jest.fn((state, action) => ({ ...state, submittingMutation: false })),
  dispatchMutationErr: jest.fn((state, action) => ({ ...state, submittingMutation: false, errorMutation: action.payload })),
}), { virtual: true });

describe('Notice Reducer', () => {
  const initialState = {
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
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(expect.objectContaining({ fetchingNotices: false }));
  });

  it('should handle FETCH_NOTICES_REQ', () => {
    const action = { type: 'FETCH_NOTICES_REQ' };
    const state = reducer(initialState, action);
    expect(state.fetchingNotices).toBe(true);
    expect(state.fetchedNotices).toBe(false);
  });

  it('should handle FETCH_NOTICES_RESP', () => {
    const payload = {
      data: {
        notices: {
          edges: [{ node: { id: 1, title: 'Notice 1' } }],
          pageInfo: { totalCount: 1 }
        }
      }
    };
    const action = { type: 'FETCH_NOTICES_RESP', payload };
    const state = reducer(initialState, action);
    expect(state.fetchingNotices).toBe(false);
    expect(state.fetchedNotices).toBe(true);
    expect(state.notices.length).toBe(1);
    expect(state.notices[0].title).toBe('Notice 1');
  });

  it('should handle NOTICE_TOGGLE_STATUS_RESP', () => {
    const stateWithNotices = {
       ...initialState,
       notices: [{ uuid: '123', isActive: true }]
    };
    const action = {
       type: 'NOTICE_TOGGLE_STATUS_RESP',
       meta: { uuid: '123', isActive: false }
    };
    const state = reducer(stateWithNotices, action);
    expect(state.notices[0].isActive).toBe(false);
  });
});
