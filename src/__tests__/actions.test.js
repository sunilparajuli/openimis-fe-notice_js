import { fetchNotice, fetchNotices, toggleNoticeStatus, createNotice, updateNotice } from '../actions';
import { graphql, formatPageQuery, formatPageQueryWithCount, formatMutation, decodeId } from '@openimis/fe-core';

jest.mock('@openimis/fe-core', () => ({
  graphql: jest.fn((payload, type, meta) => ({ payload, type, meta })),
  formatPageQuery: jest.fn((module, filters, param) => ({ module, filters, param })),
  formatPageQueryWithCount: jest.fn((module, prms, param) => ({ module, prms, param })),
  formatMutation: jest.fn((name, gql, label, details) => ({
    payload: { name, gql },
    clientMutationId: 'mock-id'
  })),
  decodeId: jest.fn(id => id),
}), { virtual: true });

describe('Notice Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetchNotice creates GET_NOTICE action', () => {
    const action = fetchNotice(null, 'test-uuid');
    expect(action.type).toBe('GET_NOTICE');
    expect(formatPageQuery).toHaveBeenCalledWith(
      'notices',
      ['uuid: "test-uuid"'],
      expect.any(Array)
    );
  });

  it('fetchNotices creates FETCH_NOTICES action', () => {
    const prms = { page: 1 };
    const action = fetchNotices(null, prms);
    expect(action.type).toBe('FETCH_NOTICES');
    expect(formatPageQueryWithCount).toHaveBeenCalledWith(
      'notices',
      prms,
      expect.any(Array)
    );
  });

  it('toggleNoticeStatus creates NOTICE_TOGGLE_STATUS direct graphql action', () => {
    const action = toggleNoticeStatus(null, 'test-uuid', true);
    expect(action.type).toBe('NOTICE_TOGGLE_STATUS');
    expect(action.meta).toEqual({ uuid: 'test-uuid', isActive: true });
    expect(action.payload).toContain('toggleNoticeStatus(uuid: "test-uuid", isActive: true)');
  });

  it('createNotice creates mutation action', () => {
    const notice = {
      title: 'T1',
      description: 'D1',
      priority: 'HIGH',
    };
    const action = createNotice(null, notice, 'Create Label');
    expect(action.type).toEqual(['NOTICE_MUTATION_REQ', 'NOTICE_MUTATION_RESP', 'NOTICE_MUTATION_ERR']);
    expect(formatMutation).toHaveBeenCalled();
  });
});
