const crawlingDomain = require("../../../services/rssService/crawlingDomain");
import axios from "axios";

jest.mock("axios");

describe("testing crawling domain", () => {
  let link = {
    href: "https://www.nytimes.com/section/world",
    origin: "https://www.nytimes.com",
    protocol: "https:",
    username: "",
    password: "",
    host: "www.nytimes.com",
    hostname: "www.nytimes.com",
    port: "",
    pathname: "/section/world",
    search: "",
    // searchParams: URLSearchParams {},
    hash: "",
  };

  let expectResult = {
    domain_name: "nytimes.com",
    logo: "https://static01.nyt.com/newsgraphics/images/icons/defaultPromoCrop.png",
    short_description:
      "Live news, investigations, opinion, photos and video by the journalists of The New York Times from more than 150 countries around the world. Subscribe for coverage of U.S. and international news, politics, business, technology, science, health, arts, sports and more.",
  };
  it("same domain name", () => {
    expect(crawlingDomain(link)).toBe(expectResult);
  });

  // test("should fetch users", () => {
  //   const users = [{ name: "Bob" }];
  //   const resp = { data: users };
  //   axios.get.mockResolvedValue(resp);

  //   // or you could use the following depending on your use case:
  //   // axios.get.mockImplementation(() => Promise.resolve(resp))

  //   return Users.all().then((data) => expect(data).toEqual(users));
  // });
});
