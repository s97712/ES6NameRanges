const fs = require("fs");
const regenerate = require('regenerate');

const get = function(what) {
  return require(`unicode-11.0.0/${ what }/code-points.js`);
};

function generatorRanges(reg_str){
  let ranges = [];
  reg_str = reg_str.slice(1,-1);

  let p = 0
  let code

  ({p, code} = getCode(reg_str, p))
  while(code != undefined){
    const range = [];

    range.push(code.codePointAt(0));

    ({p, code} = getCode(reg_str, p))
    if(code == '-'){
      ({p, code} = getCode(reg_str, p))
      range.push(code.codePointAt(0));
      ({p, code} = getCode(reg_str, p))
    }
    if(!(range.length == 1 && '[]|'.indexOf(range[0]) != -1)){
      ranges.push(range);
    }
  }
  return ranges
}

function getCode(reg_str, p){
  const first = reg_str[p++]
  let code
  if(first == '\\'){
    const type = reg_str[p++]
    if(type == 'x'){
      code = String.fromCodePoint(parseInt(reg_str.slice(p, p+2), 16));
      p+= 2;
    }else if(type == 'u'){
      code = String.fromCodePoint(parseInt(reg_str.slice(p, p+4), 16));
      p+= 4;
    }else{
      code = JSON.parse(`"\\\\${code}\"`).slice(1,-1)
    }
  } else {
    code = first
  }
  return {
    p, code
  }
}

const ID_Start = get('Binary_Property/ID_Start');
const ID_Continue = get('Binary_Property/ID_Continue');
const Other_ID_Start = get('Binary_Property/Other_ID_Start');



function setup(){
  const args = process.argv.slice(2)
  if(args.length != 1 || !args[0]) {
    console.log("Usage: genNameRegex {output}");
  }

  const identifierStart = regenerate(ID_Start)
  const identifierPart = regenerate(ID_Continue)
    .add(Other_ID_Start)

  const StratRanges = generatorRanges(identifierStart.toString())
  const PartRanges = generatorRanges(identifierPart.toString())

  const cnt =
    `const StartRanges = ${JSON.stringify(StratRanges)}; \n` + 
    `const PartRanges = ${JSON.stringify(PartRanges)}; \n` +
    `module.exports = { StratRanges, PartRanges }`

  fs.writeFileSync(args[0], cnt);
}

setup()
