import { Rhum } from "../../test_deps.ts";
import { Dexter } from "../mod.ts";

Rhum.testPlan("Dexter - mod_test.ts", () => {
  Rhum.testSuite("Dexter", () => {
    Rhum.testCase("logger and all of its log functions are exposed", () => {
      const dexter = Dexter({
        tag_string: "{level} |",
      });
      Rhum.asserts.assertEquals(typeof dexter.logger.debug, "function");
      Rhum.asserts.assertEquals(typeof dexter.logger.error, "function");
      Rhum.asserts.assertEquals(typeof dexter.logger.fatal, "function");
      Rhum.asserts.assertEquals(typeof dexter.logger.info, "function");
      Rhum.asserts.assertEquals(typeof dexter.logger.trace, "function");
      Rhum.asserts.assertEquals(typeof dexter.logger.warn, "function");
    });
    Rhum.testCase("logger can be used to write messages", () => {
      const dexter = Dexter({
        tag_string: "{name} |",
        tag_string_fns: {
          name() {
            return "John Doe";
          },
        },
      });
      let actual;
      actual = dexter.logger.debug("test");
      Rhum.asserts.assertEquals(
        actual,
        "\x1b[34m[DEBUG]\x1b[39m John Doe |  test",
      );
      actual = dexter.logger.error("test");
      Rhum.asserts.assertEquals(
        actual,
        "\x1b[31m[ERROR]\x1b[39m John Doe |  test",
      );
      actual = dexter.logger.fatal("test");
      Rhum.asserts.assertEquals(
        actual,
        "\x1b[35m[FATAL]\x1b[39m John Doe |  test",
      );
      actual = dexter.logger.info("test");
      Rhum.asserts.assertEquals(
        actual,
        "\x1b[32m[INFO]\x1b[39m John Doe |  test",
      );
      actual = dexter.logger.trace("test");
      Rhum.asserts.assertEquals(
        actual,
        "\x1b[41m[TRACE]\x1b[49m John Doe |  test",
      );
      actual = dexter.logger.warn("test");
      Rhum.asserts.assertEquals(
        actual,
        "\x1b[33m[WARN]\x1b[39m John Doe |  test",
      );
    });
  });
});

Rhum.run();
