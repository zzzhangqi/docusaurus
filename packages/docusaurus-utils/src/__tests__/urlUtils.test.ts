/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  normalizeUrl,
  getEditUrl,
  fileToPath,
  isValidPathname,
  addTrailingSlash,
  addLeadingSlash,
  removeTrailingSlash,
  resolvePathname,
  encodePath,
} from '../urlUtils';

describe('normalizeUrl', () => {
  test('should normalize urls correctly', () => {
    const asserts = [
      {
        input: ['/', ''],
        output: '/',
      },
      {
        input: ['', '/'],
        output: '/',
      },
      {
        input: ['/'],
        output: '/',
      },
      {
        input: [''],
        output: '',
      },
      {
        input: ['/', '/'],
        output: '/',
      },
      {
        input: ['/', 'docs'],
        output: '/docs',
      },
      {
        input: ['/', 'docs', 'en', 'next', 'blog'],
        output: '/docs/en/next/blog',
      },
      {
        input: ['/test/', '/docs', 'ro', 'doc1'],
        output: '/test/docs/ro/doc1',
      },
      {
        input: ['/test/', '/', 'ro', 'doc1'],
        output: '/test/ro/doc1',
      },
      {
        input: ['/', '/', '2020/02/29/leap-day'],
        output: '/2020/02/29/leap-day',
      },
      {
        input: ['', '/', 'ko', 'hello'],
        output: '/ko/hello',
      },
      {
        input: ['hello', 'world'],
        output: 'hello/world',
      },
      {
        input: ['http://www.google.com/', 'foo/bar', '?test=123'],
        output: 'http://www.google.com/foo/bar?test=123',
      },
      {
        input: ['http:', 'www.google.com///', 'foo/bar', '?test=123'],
        output: 'http://www.google.com/foo/bar?test=123',
      },
      {
        input: ['http://foobar.com', '', 'test'],
        output: 'http://foobar.com/test',
      },
      {
        input: ['http://foobar.com', '', 'test', '/'],
        output: 'http://foobar.com/test/',
      },
      {
        input: ['/', '', 'hello', '', '/', '/', '', '/', '/world'],
        output: '/hello/world',
      },
      {
        input: ['', '', '/tt', 'ko', 'hello'],
        output: '/tt/ko/hello',
      },
      {
        input: ['', '///hello///', '', '///world'],
        output: '/hello/world',
      },
      {
        input: ['', '/hello/', ''],
        output: '/hello/',
      },
      {
        input: ['', '/', ''],
        output: '/',
      },
      {
        input: ['///', '///'],
        output: '/',
      },
      {
        input: ['/', '/hello/world/', '///'],
        output: '/hello/world/',
      },
      {
        input: ['file://', '//hello/world/'],
        output: 'file:///hello/world/',
      },
      {
        input: ['file:', '/hello/world/'],
        output: 'file:///hello/world/',
      },
      {
        input: ['file://', '/hello/world/'],
        output: 'file:///hello/world/',
      },
      {
        input: ['file:', 'hello/world/'],
        output: 'file://hello/world/',
      },
    ];
    asserts.forEach((testCase) => {
      expect(normalizeUrl(testCase.input)).toBe(testCase.output);
    });

    expect(() =>
      // @ts-expect-error undefined for test
      normalizeUrl(['http:example.com', undefined]),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Url must be a string. Received undefined"`,
    );
  });
});

describe('getEditUrl', () => {
  test('returns right path', () => {
    expect(
      getEditUrl('foo/bar.md', 'https://github.com/facebook/docusaurus'),
    ).toEqual('https://github.com/facebook/docusaurus/foo/bar.md');
    expect(
      getEditUrl('foo/你好.md', 'https://github.com/facebook/docusaurus'),
    ).toEqual('https://github.com/facebook/docusaurus/foo/你好.md');
  });
  test('always returns valid URL', () => {
    expect(
      getEditUrl('foo\\你好.md', 'https://github.com/facebook/docusaurus'),
    ).toEqual('https://github.com/facebook/docusaurus/foo/你好.md');
  });
  test('returns undefined for undefined', () => {
    expect(getEditUrl('foo/bar.md')).toBeUndefined();
  });
});

test('fileToPath', () => {
  const asserts: Record<string, string> = {
    'index.md': '/',
    'hello/index.md': '/hello/',
    'foo.md': '/foo',
    'foo/bar.md': '/foo/bar',
    'index.js': '/',
    'hello/index.js': '/hello/',
    'foo.js': '/foo',
    'foo/bar.js': '/foo/bar',
  };
  Object.keys(asserts).forEach((file) => {
    expect(fileToPath(file)).toBe(asserts[file]);
  });
});

test('isValidPathname', () => {
  expect(isValidPathname('/')).toBe(true);
  expect(isValidPathname('/hey')).toBe(true);
  expect(isValidPathname('/hey/ho')).toBe(true);
  expect(isValidPathname('/hey/ho/')).toBe(true);
  expect(isValidPathname('/hey/h%C3%B4/')).toBe(true);
  expect(isValidPathname('/hey///ho///')).toBe(true); // Unexpected but valid
  expect(isValidPathname('/hey/héllô you')).toBe(true);

  expect(isValidPathname('')).toBe(false);
  expect(isValidPathname('hey')).toBe(false);
  expect(isValidPathname('/hey?qs=ho')).toBe(false);
  expect(isValidPathname('https://fb.com/hey')).toBe(false);
  expect(isValidPathname('//hey')).toBe(false);
  expect(isValidPathname('////')).toBe(false);
});

describe('addTrailingSlash', () => {
  test('should no-op', () => {
    expect(addTrailingSlash('/abcd/')).toEqual('/abcd/');
  });
  test('should add /', () => {
    expect(addTrailingSlash('/abcd')).toEqual('/abcd/');
  });
});

describe('addLeadingSlash', () => {
  test('should no-op', () => {
    expect(addLeadingSlash('/abc')).toEqual('/abc');
  });
  test('should add /', () => {
    expect(addLeadingSlash('abc')).toEqual('/abc');
  });
});

describe('removeTrailingSlash', () => {
  test('should no-op', () => {
    expect(removeTrailingSlash('/abcd')).toEqual('/abcd');
  });
  test('should remove /', () => {
    expect(removeTrailingSlash('/abcd/')).toEqual('/abcd');
  });
});

test('resolvePathname', () => {
  // These tests are directly copied from https://github.com/mjackson/resolve-pathname/blob/master/modules/__tests__/resolvePathname-test.js
  // Maybe we want to wrap that logic in the future?
  expect(resolvePathname('c')).toEqual('c');
  expect(resolvePathname('c', 'a/b')).toEqual('a/c');
  expect(resolvePathname('/c', '/a/b')).toEqual('/c');
  expect(resolvePathname('', '/a/b')).toEqual('/a/b');
  expect(resolvePathname('../c', '/a/b')).toEqual('/c');
  expect(resolvePathname('c', '/a/b')).toEqual('/a/c');
  expect(resolvePathname('c', '/a/')).toEqual('/a/c');
  expect(resolvePathname('..', '/a/b')).toEqual('/');
});

test('encodePath', () => {
  expect(encodePath('a/foo/')).toEqual('a/foo/');
  expect(encodePath('a/<foo>/')).toEqual('a/%3Cfoo%3E/');
  expect(encodePath('a/你好/')).toEqual('a/%E4%BD%A0%E5%A5%BD/');
});
