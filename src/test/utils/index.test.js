
const { postCountScore, postScore, nonBpScoreWilsonScore, convertString } = require('../../utils')

describe('testing custom utils ', () => {
  it('string to be slug', () => {
    expect(convertString("hello world", " ", "-")).toBe("hello-world");
  })
});

describe('testing utils formula post count score ', () => {
  it('post count score to be 1', () => {
    expect(postCountScore(2, 7)).toBe(1);
  });
  it('post count score to be 1', () => {
    expect(postCountScore(3, 7)).toBe(1);
  });
  it('post count score to be 1', () => {
    expect(postCountScore(6, 7)).toBe(1);
  });
  it('post count score to be 1', () => {
    expect(postCountScore(7, 7)).toBe(1);
  });
  it('post count score to be 1', () => {
    expect(postCountScore(0, 7)).toBe(1);
  });
  it('post count score to be 0,875', () => {
    expect(postCountScore(8, 7)).toBe(0.875);
  });
  it('post count score to be 0,7', () => {
    expect(postCountScore(10, 7)).toBe(0.7);
  });
  it('post count score to be 0,7', () => {
    expect(postCountScore(50, 7)).toBe(0.14);
  });
  it('post count score to be 0,7', () => {
    expect(postCountScore(70, 7)).toBe(0.1);
  });
  it('post count score to be 0,7', () => {
    expect(postCountScore(140, 7)).toBe(0.05);
  });
});

describe('testing utils formula post score ', () => {
  it('post count score to be 1', () => {
    expect(postScore(1, 0.996045550500996, 45, 2.58747698, 1, 0.911187889530622, 8)).toBe(1);
  });
});

describe('testing utils formula non bp wilson score ', () => {
  it('post count score to be 0.000999002995', () => {
    expect(nonBpScoreWilsonScore(5, 5, 0.1, 99.90)).toBe(0.000999002995);
  });
});
