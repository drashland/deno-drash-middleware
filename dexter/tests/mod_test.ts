import { Rhum } from "../../test_deps.ts";

Rhum.testPlan("Dexter - mod_test.ts", () => {
  Rhum.testSuite("Dexter", () => {
    Rhum.testCase("logger and all of its log functions are exposed", () => {
    });
  });
});

Rhum.run();
