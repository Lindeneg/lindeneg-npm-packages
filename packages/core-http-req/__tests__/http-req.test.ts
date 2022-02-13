import 'whatwg-fetch';
import { CacheStrategy, ReqMethod } from '../src';
import HttpReq from '../src/http-req';

const post = { id: 'md1', title: 'awesome', description: 'miles davis' };

type Post = Partial<typeof post>;

interface IPost {
  id: string;
  title: string;
  description: string;
}

interface ErrorResponse {
  message: string;
  dev?: unknown;
}

describe('Test Suite: @lindeneg/http-req', () => {
  let httpReq: HttpReq;

  beforeEach(() => {
    window.localStorage.clear();
    httpReq && httpReq.destroy();
    httpReq = new HttpReq({ baseUrl: 'http://localhost:8000/api' });
  });
  test('GET 200: can initialize with LS cache strategy', async () => {
    const _httpReq = new HttpReq({
      baseUrl: 'http://localhost:8000/api',
      cacheConfig: {
        strategy: CacheStrategy.LocalStorage,
      },
    });
    const { data, error, fromCache, statusCode } = await _httpReq.getJson<Post>(
      '/post/md1'
    );
    expect(data).toEqual(post);
    expect(error).toBeUndefined();
    expect(fromCache).toEqual(false);
    expect(statusCode).toEqual(200);
  });
  test('GET 200: can get valid item from LS cache', async () => {
    const _httpReq = new HttpReq({
      baseUrl: 'http://localhost:8000/api',
      cacheConfig: { strategy: CacheStrategy.LocalStorage },
    });
    await _httpReq.getJson('/post/md1');
    const { data, error, fromCache, statusCode } = await _httpReq.getJson<Post>(
      '/post/md1'
    );
    expect(data).toEqual(post);
    expect(error).toBeUndefined();
    expect(fromCache).toEqual(true);
    expect(
      JSON.parse(
        window.localStorage.getItem(
          '__cl_ls_cache__http://localhost:8000/api/post/md1'
        ) || ''
      ).value
    ).toEqual(post);
    expect(statusCode).toBeUndefined();
  });
  test('GET 200: can get valid item with no cache strategy', async () => {
    const _httpReq = new HttpReq({
      baseUrl: 'http://localhost:8000/api',
      cacheConfig: { strategy: CacheStrategy.None },
    });
    await _httpReq.getJson('/post/md1');
    const { data, error, fromCache, statusCode } =
      await _httpReq.getJson<IPost>('/post/md1');
    expect(data).toEqual(post);
    expect(error).toBeUndefined();
    expect(fromCache).toEqual(false);
    expect(
      window.localStorage.getItem(
        '__cl_ls_cache__http://localhost:8000/api/post/md1'
      )
    ).toEqual(null);
    expect(statusCode).toBe(200);
  });
  test('GET 200: can get a valid item without baseUrl', async () => {
    const _httpReq = new HttpReq();
    const { data, error, fromCache, statusCode } =
      await _httpReq.getJson<IPost>('http://localhost:8000/api/post/md1');
    expect(data).toEqual(post);
    expect(error).toBeUndefined();
    expect(fromCache).toEqual(false);
    expect(statusCode).toEqual(200);
  });
  test('GET 200: can get a valid item', async () => {
    const { data, error, fromCache, statusCode } = await httpReq.getJson<IPost>(
      '/post/md1'
    );
    expect(data).toEqual(post);
    expect(error).toBeUndefined();
    expect(fromCache).toEqual(false);
    expect(statusCode).toEqual(200);
  });
  test('GET 200: can get valid item from M cache', async () => {
    await httpReq.getJson('/post/md1');
    const { data, error, fromCache, statusCode } = await httpReq.getJson<Post>(
      '/post/md1'
    );
    expect(data).toEqual(post);
    expect(error).toBeUndefined();
    expect(fromCache).toEqual(true);
    expect(statusCode).toBeUndefined();
  });
  test('GET 404: can not get invalid item', async () => {
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
  test('POST 201: can post valid item', async () => {
    const { data, error, fromCache, statusCode } = await httpReq.sendJson<Post>(
      '/post',
      { title: post.title, description: post.description }
    );
    expect(data).toEqual(post);
    expect(error).toBeUndefined();
    expect(fromCache).toBeUndefined();
    expect(statusCode).toEqual(201);
  });
  test('POST 400: cannot post with invalid body', async () => {
    const { data, error, fromCache, statusCode } = await httpReq.sendJson<
      Post,
      ErrorResponse
    >('/post', { title: post.title }, ReqMethod.POST);
    expect(data).toBeUndefined();
    expect(error).toEqual({
      dev: 'description is missing from body',
      message:
        'The requested action could not be exercised due to malformed syntax.',
    });
    expect(fromCache).toBeUndefined();
    expect(statusCode).toEqual(400);
  });
  test('PUT 201: can put valid item', async () => {
    const { data, error, fromCache, statusCode } = await httpReq.sendJson<Post>(
      '/post',
      { title: post.title, description: post.description },
      ReqMethod.PUT
    );
    expect(data).toEqual(post);
    expect(error).toBeUndefined();
    expect(fromCache).toBeUndefined();
    expect(statusCode).toEqual(201);
  });
  test('PUT 400: cannot put with invalid body', async () => {
    const { data, error, fromCache, statusCode } = await httpReq.sendJson<
      Post,
      ErrorResponse
    >('/post', { description: post.description }, ReqMethod.PUT);
    expect(data).toBeUndefined();
    expect(error).toEqual({
      dev: 'title is missing from body',
      message:
        'The requested action could not be exercised due to malformed syntax.',
    });
    expect(fromCache).toBeUndefined();
    expect(statusCode).toEqual(400);
  });
  test('PATCH 200: can patch valid item', async () => {
    const { data, error, fromCache, statusCode } = await httpReq.sendJson<Post>(
      '/post/' + post.id,
      { title: 'new title' },
      ReqMethod.PATCH
    );
    expect(data).toEqual({ ...post, title: 'new title' });
    expect(error).toBeUndefined();
    expect(fromCache).toBeUndefined();
    expect(statusCode).toEqual(200);
  });
  test('PATCH 404: cannot patch invalid item', async () => {
    const { data, error, fromCache, statusCode } = await httpReq.sendJson<
      Post,
      ErrorResponse
    >('/post/md2', { title: 'new title' }, ReqMethod.PATCH);
    expect(data).toBeUndefined();
    expect(error).toEqual({
      dev: 'id does not exist',
      message: 'The requested resource could not be found.',
    });
    expect(fromCache).toBeUndefined();
    expect(statusCode).toEqual(404);
  });
  test('PATCH 400: cannot patch with invalid body', async () => {
    const { data, error, fromCache, statusCode } = await httpReq.sendJson<
      Post,
      ErrorResponse
    >('/post/' + post.id, {}, ReqMethod.PATCH);
    expect(data).toBeUndefined();
    expect(error).toEqual({
      dev: 'no properties specified to update',
      message:
        'The requested action could not be exercised due to malformed syntax.',
    });
    expect(fromCache).toBeUndefined();
    expect(statusCode).toEqual(400);
  });
  test('DELETE 200: can patch valid item', async () => {
    const { data, error, fromCache, statusCode } =
      await httpReq.deleteJson<Post>('/post/' + post.id);
    expect(data).toEqual(post);
    expect(error).toBeUndefined();
    expect(fromCache).toBeUndefined();
    expect(statusCode).toEqual(200);
  });
  test('DELETE 404: cannot patch invalid item', async () => {
    const { data, error, fromCache, statusCode } = await httpReq.deleteJson<
      Post,
      ErrorResponse
    >('/post/md2');
    expect(data).toBeUndefined();
    expect(error).toEqual({
      dev: 'id does not exist',
      message: 'The requested resource could not be found.',
    });
    expect(fromCache).toBeUndefined();
    expect(statusCode).toEqual(404);
  });
  test('can commence with no AbortController', async () => {
    //@ts-expect-error asd
    window.AbortController = null;
    const { data, error, fromCache, statusCode } = await httpReq.deleteJson<
      Post,
      ErrorResponse
    >('/post/md2');
    expect(data).toBeUndefined();
    expect(error).toEqual({
      dev: 'id does not exist',
      message: 'The requested resource could not be found.',
    });
    expect(fromCache).toBeUndefined();
    expect(statusCode).toEqual(404);
  });
  test('returns error on no window.fetch', async () => {
    //@ts-expect-error asd
    window.fetch = null;
    const { data, error, fromCache, statusCode } = await httpReq.deleteJson<
      Post,
      ErrorResponse
    >('/post/md2');
    expect(data).toBeUndefined();
    expect(error?.message).toEqual(
      "'fetch' is not available in current environment"
    );
    expect(fromCache).toBeUndefined();
    expect(statusCode).toBeUndefined();
  });
});
