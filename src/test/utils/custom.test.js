const { capitalizing, checkIfValidURL } = require("../../utils");

describe('testing utils capitalizing', () => {
    it('string capitalizing lower', () => {
        // capitalizing()
        // expect(postCountScore(2, 7)).toBe(1);
    });
});

describe('URL validation', () => {
    let matchedUrl = 'https://edition.cnn.com/travel/article/air-france-pilots-cockpit-fight/index.html'
    it('returns valid https URL', () => {
        expect(checkIfValidURL('https://edition.cnn.com/travel/article/air-france-pilots-cockpit-fight/index.html')).toBe(matchedUrl)
    })
    it('returns https from non protocol URL', () => {
        expect(checkIfValidURL('edition.cnn.com/travel/article/air-france-pilots-cockpit-fight/index.html')).toBe(matchedUrl)
    })
    it('returns false from non url', () => {
        expect(checkIfValidURL('Coba saja')).toBe(false)
    })
    it('returns valid URL from url with trailing space', () => {
        expect(checkIfValidURL('https://edition.cnn.com/travel/article/air-france-pilots-cockpit-fight/index.html%20halo123')).toBe(matchedUrl)
    })
    it('returns valid URL from url with trailing newline', () => {
        expect(checkIfValidURL('https://edition.cnn.com/travel/article/air-france-pilots-cockpit-fight/index.html%0Ahalo123')).toBe(matchedUrl)
    })
    it('returns valid URL from url with leading text', () => {
        let urlString = 'halo%0A%0Ahalo123https://edition.cnn.com/travel/article/air-france-pilots-cockpit-fight/index.html%0Ahalo123'
        expect(checkIfValidURL(urlString)).toBe(matchedUrl)
    })
    it('returns valid URL from url with month and date without html', () => {
        let urlString = 'halo%0A%0Ahalo123https://www.kompas.com/tren/read/2022/08/30/114612465/rekonstruksi-pembunuhan-brigadir-j-ferdy-sambo-pakai-baju-tahanan-putri%0Ahalo123'
        expect(checkIfValidURL(urlString)).toBe('https://www.kompas.com/tren/read/2022/08/30/114612465/rekonstruksi-pembunuhan-brigadir-j-ferdy-sambo-pakai-baju-tahanan-putri')
    })
})