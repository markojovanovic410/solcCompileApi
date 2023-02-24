const express = require("express");
const app = express();
const solc = require("solc");
const bodyParser = require("body-parser");

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

app.post("/solc-compile", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  
  if (!req.body.code || req.body.code == "") {
    res.json({ result: -1, error: "Need contract code!" });
    return;
  }
  let eo = true;
  let oa = 200;
  if (req.body.eo && req.body.eo == "false") eo = false;
  if (req.body.oa) oa = parseInt(req.body.oa);
  const input = {
    language: "Solidity",
    sources: {
      a: {
        content: req.body.code,
      },
    },
    settings: {
      optimizer: {
        enabled: eo,
        runs: oa,
      },
      outputSelection: {
        "*": {
          "*": ["*"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  if (output.contracts) {
    res.json({
      result: 1,
      abi: output.contracts.a.SimpleStorage.abi,
      bytecode: output.contracts.a.SimpleStorage.evm.bytecode.object,
    });
  } else {
    res.json({ result: 0, error: output.errors });
  }
});

app.get("/", function (req, res) {
  res.json("This is solc compile api!");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
