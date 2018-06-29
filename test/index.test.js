/* Created by tommyZZM.OSX on 2018/5/22. */
"use strict";
const util = require("util")
const expect = require("chai").expect
const treey = require("../lib");

function log_data(data) {
  console.log(util.inspect(data, {showHidden: true, depth: null}))
  return data;
}

describe("basic", function () {

  it("hello world example", function () {
    const S = treey.create((S) => {
      S.vars = {
        assigned_variable: "hello"
      };
      S.some_global_variable(_ => "some_thing");
      S.def("target_template", _ => (target_name, def) => {
        S("target", t => {
          t.target_name(target_name);
          t.sources(["./deps/dep.cc"]);
          t.include_dirs(["./include"]);
          def(t);
        });
      });
      S.target_template("main", (t) => {
        t.include_dirs.merge([
          "./src/include"
        ])
        t.sources(({merge}) => merge([
          "./src/main.cc"
        ]));
      });
      S.target_template("example", (t) => {
        t.include_dirs(({merge}) => merge([
          "./example/include"
        ]))
        t.sources(({merge}) => merge([
          "./example/example.cc"
        ]));
      });
    });

    return S.toData(true).then((data) => {
      // console.log(util.inspect(data, { showHidden: true, depth: null }));
      const data_children = data.$children;
      expect(data).have.property('some_global_variable', "some_thing");
      const targets_wrap = data_children.filter(([name]) => name === "target");
      const targets = targets_wrap.map(([_, target]) => target);

      expect(targets.length).to.be.equal(2);

      const target_main = targets.find(({target_name}) => target_name === "main");
      expect(target_main).to.exist;
      expect(target_main.include_dirs).to.be.deep.equal([ './include', './src/include' ]);
      expect(target_main.sources).to.be.deep.equal([ './deps/dep.cc', './src/main.cc' ]);

      const target_example = targets.find(({target_name}) => target_name === "example");
      expect(target_example).to.exist;
      expect(target_example.include_dirs).to.be.deep.equal([ './include', './example/include' ]);
      expect(target_example.sources).to.be.deep.equal([ './deps/dep.cc', './example/example.cc' ]);
    });
  })

  it("scope reference each other", function () {
    const S = treey.create(S => {
      S.def("get_some_local", s => _ => {
        return s.vars.some_local
      })

      S("child", child => {
        child.some_local(1);
        child.read_some_local(child.get_some_local());
      })

      S("child", child => {
        child.some_local(2);
        child.read_some_local(child.get_some_local());
      })
    })

    return S.toData(true).then(data => {
      const data_children_array = data.$children;
      const children_data = data_children_array.map(child => child[1]);

      expect(children_data[0]).to.be.own.property("read_some_local", 1);
      expect(children_data[1]).to.be.own.property("read_some_local", 2);
    })
  })

  it("scope wrap", function () {
    const S = treey.create(S => {
      S("level1", level1 => {
        level1("level2", level2 => {
          level2.hello_in_level2(true);
          level2("level3", level3 => {
            level3.hello_in_level3(true);
          })
        })
      })
    })

    return S.toData(true).then(data => {
      const [ level1, level1_data ] = data.$children[0];
      const [ level2, level2_data ] = level1_data.$children[0]
      const [ level3, level3_data ] = level2_data.$children[0]

      expect(level1).to.be.equal("level1");
      expect(level2).to.be.equal("level2");
      expect(level2_data).to.have.own.property("hello_in_level2", true);
      expect(level3).to.be.equal("level3");
      expect(level3_data).to.have.own.property("hello_in_level3", true);
    })
  })

  it("def inside def", function () {
    const S = treey.create(S => {
      S.def("create_template", _ => (template_name, defFn) => {
        S.def(template_name, scope => (target_name, defTargetFn) => {
          scope("target", target => {
            defFn(target);
            defTargetFn(target);
            target.target_name(target_name);
          });
        });
      });

      S.create_template("some_target", target => {
        target.is_from_create_template(true);
      })

      S.some_target("xxx", target => {
        target.is_some_target(true);
      })
    })

    S.toData(true).then(data => {
      const [ type, content ] = data.$children[0];
      expect(type).to.equal("target");
      expect(content).to.have.own.property("target_name", "xxx");
      expect(content).to.have.own.property("is_from_create_template", true);
      expect(content).to.have.own.property("is_some_target", true);
    })
  })

  it("def method shared", function () {
    const S = treey.create(S => {
      S.def("project", _ => (project_name, defProject) => {
        S("project", project => {
          defProject(project);
          project.project_name(project_name);
        })
      })

      S.def("create_template", _ => (template_name, defFn) => {
        S.def(template_name, scope => (target_name, defTargetFn) => {
          scope("target", target => {
            defFn(target);
            defTargetFn(target);
            target.target_name(target_name);
          });
        });
      });

      S.create_template("some_target", target => {
        target.is_from_create_template(true);
      })

      S.project("some_project", project => {
        project.is_project(true);
        project.some_target("xxx", target => {
          target.is_some_target(true);
        })
      })
    });

    return S.toData(true).then(data => {
      const [_, project_data] = data.$children[0];
      expect(project_data.project_name).to.be.equal("some_project");
      expect(project_data.is_project).to.be.equal(true);

      const [__, target_data] = project_data.$children[0];
      expect(target_data.is_from_create_template).to.be.equal(true);
      expect(target_data.is_some_target).to.be.equal(true);
      expect(target_data.target_name).to.be.equal("xxx");
    })
  })

})
