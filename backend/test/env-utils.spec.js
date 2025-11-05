import { describe, it, expect } from 'vitest';
import { parseCsvEnv, parseEmailsEnv, parseCorsOrigins } from '../src/utils/env-utils.js';

describe('env-utils', () => {
  it('parseCsvEnv trims and removes empty entries', () => {
    const input = 'a@example.com, b@example.com, ';
    expect(parseCsvEnv(input)).toEqual(['a@example.com', 'b@example.com']);
  });

  it('parseEmailsEnv lowercases emails', () => {
    const input = 'A@Example.COM, B@Example.COM,';
    expect(parseEmailsEnv(input)).toEqual(['a@example.com', 'b@example.com']);
  });

  it('parseCorsOrigins combines frontend url and origins csv', () => {
    const frontend = 'http://localhost:5173';
    const csv = 'http://example.com, http://foo.test,';
    const out = parseCorsOrigins(frontend, csv).sort();
    expect(out).toEqual(['http://example.com', 'http://foo.test', 'http://localhost:5173'].sort());
  });
});
