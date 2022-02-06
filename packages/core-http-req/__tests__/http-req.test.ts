import HttpReq from '../src/http-req';

const post = { id: 'md1', title: 'awesome', description: 'miles davis' };

type Post = typeof post;

type ErrorResponse = {
  message: string;
  dev?: unknown;
};

describe('Test Suite: @lindeneg/http-req', () => {
  let httpReq: HttpReq;

  beforeEach(() => {
    httpReq && httpReq.destroy();
    httpReq = new HttpReq({ baseUrl: 'http://localhost:8000/api' });
  });
  test('200: can get a valid item without baseUrl', async () => {
    const _httpReq = new HttpReq();
    const { data, error, fromCache, statusCode } = await _httpReq.getJson<
      Post,
      ErrorResponse
    >('http://localhost:8000/api/post/md1');
    expect(data).toEqual(post);
    expect(error).toBeUndefined();
    expect(fromCache).toEqual(false);
    expect(statusCode).toEqual(200);
  });
  test('200: can get a valid item', async () => {
    const { data, error, fromCache, statusCode } = await httpReq.getJson<
      Post,
      ErrorResponse
    >('/post/md1');
    expect(data).toEqual(post);
    expect(error).toBeUndefined();
    expect(fromCache).toEqual(false);
    expect(statusCode).toEqual(200);
  });
  test('200: can get valid item from cache', async () => {
    await httpReq.getJson('/post/md1');
    const { data, error, fromCache, statusCode } = await httpReq.getJson<
      Post,
      ErrorResponse
    >('/post/md1');
    expect(data).toEqual(post);
    expect(error).toBeUndefined();
    expect(fromCache).toEqual(true);
    expect(statusCode).toBeUndefined();
  });
  test('404: can not get invalid item', async () => {
    const { data, error, fromCache, statusCode } = await httpReq.getJson<
      Post,
      ErrorResponse
    >('/post/md2');
    expect(data).toBeUndefined();
    expect(error).toEqual({
      dev: 'id does not exist',
      message: 'The requested resource could not be found.',
    });
    expect(fromCache).toEqual(false);
    expect(statusCode).toEqual(404);
  });
});
