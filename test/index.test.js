/* Created by tommyZZM.OSX on 2018/5/22. */
"use strict";
const util = require("util")
const expect = require("chai").expect
const treey = require("../lib");

describe("basic", function () {

  it("hello world example", function () {
    const S = treey.create((S, $) => {
      $.some_global_variable(_ => "some_thing");
      S.def("target_template", _ => (target_name, def) => {
        S("targets", targets => {
          targets("target", (target, $) => {
            $.target_name(target_name);
            $.sources(["./deps/dep.cc"]);
            $.include_dirs(({reset}) => reset(["./include"]));
            def(target, $);
          });
        });
      });
      S.target_template("main", (_, $) => {
        $.sources(({merge}) => merge([
          "./example/main.cc"
        ]));
      });
      S.target_template("example", (_, $) => {
        $.include_dirs(({merge}) => merge([
          "./example/include"
        ]))
        $.sources(({merge}) => merge([
          "./example/example.cc"
        ]));
      });
    });

    return S.toData(true).then((data) => {
      const data_children = data.$children;
      expect(data).have.property('some_global_variable', "some_thing");
      const targets_wrap = data_children.filter(([name]) => name === "targets");
      const targets = targets_wrap.map(([_, target]) => target.$children[0][1]);

      expect(targets.length).to.be.equal(2);

      const target_main = targets.find(({target_name}) => target_name === "main");
      expect(target_main).to.exist;
      expect(target_main.include_dirs).to.be.deep.equal([ './include' ]);
      expect(target_main.sources).to.be.deep.equal([ './deps/dep.cc', './example/main.cc' ]);

      const target_example = targets.find(({target_name}) => target_name === "example");
      expect(target_example).to.exist;
      expect(target_example.include_dirs).to.be.deep.equal([ './include', './example/include' ]);
      expect(target_example.sources).to.be.deep.equal([ './deps/dep.cc', './example/example.cc' ]);
    });
  })

})
