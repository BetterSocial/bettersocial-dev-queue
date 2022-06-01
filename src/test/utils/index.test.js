
const {
    convertString,
    postCountScore, postScore, weightPostLongComments, upDownScoreWilsonScore, removeSubDomain
} = require('../../utils')

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

describe('testing utils formula weight post long coments ', () => {
    it('weight post long coments to be 1.008', () => {
        expect(weightPostLongComments(2, 250, 1)).toBe(1.008);
    });
});

describe('testing utils formula up down score wilson score ', () => {
    it('up down score wilson score to be 0.823874038813621', () => {
        expect(upDownScoreWilsonScore(1, 0, 3, 54.62)).toBe(0.8238740388136214);
    });
});

describe('testing utils custom removeSubDomain', () => {
    it('domain has subdomain', () => {
        expect(removeSubDomain('sport.detik.com')).toBe('detik.com');
    });
    it("domain don't have subdomain", () => {
        expect(removeSubDomain('detik.com')).toBe('detik.com');
    })
})
