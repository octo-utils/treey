/* Created by tommyZZM.OSX on 2018/5/22. */
"use strict";
const util = require("util")
const expect = require("chai").expect
const treey = require("../lib");

describe("context", function () {
  let S = treey.create((S, set) => {
    set.some_global_variable(_ => "some_thing");
    S.def("target_template", _ => (target_name, def) => {
      S("targets", targets => {
        targets("target", (target, set) => {
          set.traget_name(target_name);
          set.sources(["./deps/dep.cc"]);
          set.include_dirs(({reset}) => reset(["./include"]));
          def(target, set);
        });
      });
    });
    S.target_template("example", (_, set) => {
      set.sources(({merge}) => merge([
        "./example/main.cc"
      ]));
    });
  });

  S.toData().then((data) => {
    console.log(util.inspect(data, {showHidden: true, depth: null}))
  });
})
