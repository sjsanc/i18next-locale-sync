import { hello, extractArgs } from "../src/sync";

test("hello", () => {
  expect(hello()).toEqual("hello");
});

describe("Extract arguments from cmd", () => {
  const args = [null, null, "en.json", "es.json"];
  it("should return a master JS object and an array of subscriber JS objects", () => {
    expect(extractArgs(args)).toEqual({
      master: { [".LANG"]: "en", test: "test" },
      subscribers: [{ [".LANG"]: "es", test: "test" }],
    });
  });
});
