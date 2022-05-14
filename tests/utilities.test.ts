import { isObject, pruneKeys } from "./../src/utilities";
import { extractDotnestedKeys, mergeDeep } from "../src/utilities";

const MASTER_DATASET = {
  test: "test",
  nest: {
    nestedTest: "nestedTest",
  },
  uniqueToSetOne: "This key is unique to this set",
};

const SUBORDINATE_DATASET = {
  test: "test",
  nest: {
    nestedTest: "nestedTest",
  },
  pruningTarget: "This key should be pruned after a merge",
};

test("[isObject]: Should confirm that arg is an object", () => {
  expect(isObject({})).toEqual(true);
});

test("[extractDotnestedKeys]: An object should be converted into a Map of dotnested key-value pairs", () => {
  const dotnestedObj = extractDotnestedKeys(null, MASTER_DATASET);
  expect(dotnestedObj).toEqual(
    new Map([
      ["test", "test"],
      ["nest.nestedTest", "nestedTest"],
      ["uniqueToSetOne", "This key is unique to this set"],
    ])
  );
});

test("[mergeDeep]: Should recursively merge the keys from a target into a source object, creating and providing an empty string for any missing keys", () => {
  const mergedDataset = mergeDeep(SUBORDINATE_DATASET, MASTER_DATASET);
  expect(mergedDataset).toEqual({
    test: "test",
    nest: {
      nestedTest: "nestedTest",
    },
    pruningTarget: "This key should be pruned after a merge",
    uniqueToSetOne: "",
  });
});

test("[pruneKeys] Should recursively remove any keys present in the subordinate locale that aren't in the master", () => {
  const mergedDataset = mergeDeep(SUBORDINATE_DATASET, MASTER_DATASET);
  const prunedDataset = pruneKeys(mergedDataset, MASTER_DATASET);
  expect(prunedDataset).toEqual({
    test: "test",
    nest: {
      nestedTest: "nestedTest",
    },
    uniqueToSetOne: "",
  });
});
