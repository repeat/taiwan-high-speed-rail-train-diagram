const today = new Date(),
  tomorrow = new Date(today).setDate(today.getDate() + 1),
  // 擷取今天和明天的日期
  todayDate = d3.timeFormat("%Y/%m/%d")(today),
  tomorrowDate = d3.timeFormat("%Y/%m/%d")(tomorrow);

// 擷取時間
let parseTime = (timeString) => {
  let hour = timeString.split(":")[0],
    prefix = ((hour === "00") ? tomorrowDate : todayDate) + " ";

  return d3.timeParse("%Y/%m/%d %H:%M")(prefix + timeString);
}

// 手動加減時間
let addMinutes = (source, minutes = 0) => {
  // source 必須是 DateTime object
  output = new Date(source);
  output.setMinutes(output.getMinutes() + parseInt(minutes));
  return output;
}

// 設定車站資料
const stations = {
  "01": "南港",
  "02": "台北",
  "03": "板橋",
  "04": "桃園",
  "05": "新竹",
  "06": "苗栗",
  "07": "台中",
  "08": "彰化",
  "09": "雲林",
  "10": "嘉義",
  "11": "台南",
  "12": "左營",
}, mileage = {
  NAG: -3.298,
  TPE: 5.904,
  BAQ: 13.120,
  TAY: 42.285,
  HSC: 72.179,
  MIL: 104.865,
  TAC: 165.733,
  CHH: 193.886,
  YUL: 218.480,
  CHY: 251.585,
  TNN: 313.860,
  ZUY: 345.188,
}, intervals = {
  TPE: -3,
  BAQ: -1,
  TAY: -1,
  HSC: -1,
  MIL: -1,
  TAC: -2,
  CHH: -1,
  YUL: -1,
  CHY: -1,
  TNN: -1,
};

// 設定自訂座標間隔
const yTickValues = [
  mileage.NAG,
  mileage.TPE,
  mileage.BAQ,
  mileage.TAY,
  mileage.HSC,
  mileage.MIL,
  mileage.TAC,
  mileage.CHH,
  mileage.YUL,
  mileage.CHY,
  mileage.TNN,
  mileage.ZUY,
];

// 設定顏色
const colors = {
  /* 東京メトロ銀座線 Orange */
  "1": "#f29903",
  /* 東京メトロ有楽町線 Gold */
  "2": "#c1a470",
  /* 都営地下鉄浅草線 Rose */
  "3": "#e96e61",
  "4": "silver",
  /* 東京メトロ南北線 Emerald */
  "5": "#00b5ad",
  /* 東京メトロ半蔵門線 Purple*/
  "6": "#9a7bb2",
  "7": "green",
  /* 東京メトロ東西線 Sky */
  "8": "#07abe4",
  "9": "brown",
};

// 設定自訂座標資料
let yTickFormat = (_, i) => {
  let j = d3.format("02")(i + 1);
  return stations[j];
};

// 設定範圍
const margin = { top: 20, right: 40, bottom: 20, left: 40 },
  width = 4200 - margin.left - margin.right,
  height = 700 - margin.top - margin.bottom;

// 設定 SVG
let svg = d3.select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

// 設定 X 軸
let x = d3.scaleTime()
  // 座標範圍
  .range([0, width])
  // 資料範圍
  .domain([parseTime("05:50"), parseTime("00:10")]),
  xAxisBottom = d3.axisBottom(x)
    .tickArguments([d3.timeMinute.every(10)])
    .tickFormat(d3.timeFormat("%H:%M")),
  xAxisTop = d3.axisTop(x)
    .tickArguments([d3.timeMinute.every(10)])
    .tickFormat(d3.timeFormat("%H:%M")),
  xAxisVertical = d3.axisTop(x)
    .tickArguments([d3.timeMinute.every(10)])
    .tickFormat("")
    .tickSize(height);

// 設定 Y 軸
let y = d3.scaleLinear()
  .range([0, height])
  .domain([mileage.NAG, mileage.ZUY]),
  yAxisLeft = d3.axisLeft(y)
    .tickValues(yTickValues)
    .tickFormat(yTickFormat),
  yAxisRight = d3.axisRight(y)
    .tickValues(yTickValues)
    .tickFormat(yTickFormat),
  yAxisHorizon = d3.axisRight(y)
    .tickValues(yTickValues)
    .tickFormat("")
    .tickSize(width);

// 畫 X 軸
svg.append("g")
  .attr("class", "x axis bottom")
  .attr("transform", "translate(0, " + height + ")")
  .call(xAxisBottom);
svg.append("g")
  .attr("class", "x axis top")
  .call(xAxisTop);
svg.append("g")
  .attr("class", "x axis vertical")
  .attr("transform", "translate(0, " + height + ")")
  .call(xAxisVertical);

// 畫 Y 軸
svg.append("g")
  .attr("class", "y axis left")
  .call(yAxisLeft);
svg.append("g")
  .attr("class", "y axis right")
  .attr("transform", "translate(" + width + ", 0)")
  .call(yAxisRight);
svg.append("g")
  .attr("class", "y axis horizon")
  .call(yAxisHorizon);

// d3.line
let valueline = d3.line()
  .x(d => { return x(d.time); })
  .y(d => { return y(d.mileage); });

// 讀取 CSV
let timeTableDate = '2024/07/01',
  rawURL = `https://raw.githubusercontent.com/repeat/taiwan-high-speed-rail-timetable/master/${timeTableDate}/timetable.csv`;

d3.csv(rawURL, (d) => {
  let trainNumber = d.車次,
    trainType = parseInt(+trainNumber / 100) % 10,
    trainDirection = (+trainNumber % 2) ? "s" : "n",
    trainWeekdays = d.行駛日,
    p = {
      NAG: parseTime(d.南港),
      TPE: parseTime(d.台北),
      BAQ: parseTime(d.板橋),
      TAY: parseTime(d.桃園),
      HSC: parseTime(d.新竹),
      MIL: parseTime(d.苗栗),
      TAC: parseTime(d.台中),
      CHH: parseTime(d.彰化),
      YUL: parseTime(d.雲林),
      CHY: parseTime(d.嘉義),
      TNN: parseTime(d.台南),
      ZUY: parseTime(d.左營)
    },
    schedule = {};

  schedule[trainNumber] = [];

  if (trainDirection === "s") {
    if (p.NAG !== null) {
      schedule[trainNumber].push(
        { mileage: mileage.NAG, time: p.NAG }
      );
    }

    if (p.TPE !== null) {
      if (p.NAG !== null) {
        schedule[trainNumber].push(
          { mileage: mileage.TPE, time: addMinutes(p.TPE, intervals.TPE) }
        );
      }
      schedule[trainNumber].push(
        { mileage: mileage.TPE, time: p.TPE }
      );
    }

    if (p.BAQ !== null) {
      schedule[trainNumber].push(
        { mileage: mileage.BAQ, time: addMinutes(p.BAQ, intervals.BAQ) },
        { mileage: mileage.BAQ, time: p.BAQ }
      );
    }

    if (p.TAY !== null) {
      schedule[trainNumber].push(
        { mileage: mileage.TAY, time: addMinutes(p.TAY, intervals.TAY) },
        { mileage: mileage.TAY, time: p.TAY }
      );
    }

    if (p.HSC !== null) {
      schedule[trainNumber].push(
        { mileage: mileage.HSC, time: addMinutes(p.HSC, intervals.HSC) },
        { mileage: mileage.HSC, time: p.HSC }
      );
    }

    if (p.MIL !== null) {
      schedule[trainNumber].push(
        { mileage: mileage.MIL, time: addMinutes(p.MIL, intervals.MIL) },
        { mileage: mileage.MIL, time: p.MIL }
      );
    }

    if (trainType !== 5) {
      schedule[trainNumber].push(
        { mileage: mileage.TAC, time: addMinutes(p.TAC, intervals.TAC) }
      );
    }
    schedule[trainNumber].push(
      { mileage: mileage.TAC, time: p.TAC }
    );

    if (p.CHH !== null) {
      schedule[trainNumber].push(
        { mileage: mileage.CHH, time: addMinutes(p.CHH, intervals.CHH) },
        { mileage: mileage.CHH, time: p.CHH }
      );
    }

    if (p.YUL !== null) {
      schedule[trainNumber].push(
        { mileage: mileage.YUL, time: addMinutes(p.YUL, intervals.YUL) },
        { mileage: mileage.YUL, time: p.YUL }
      );
    }

    if (p.CHY !== null) {
      schedule[trainNumber].push(
        { mileage: mileage.CHY, time: addMinutes(p.CHY, intervals.CHY) },
        { mileage: mileage.CHY, time: p.CHY }
      );
    }

    if (p.TNN !== null) {
      schedule[trainNumber].push(
        { mileage: mileage.TNN, time: addMinutes(p.TNN, intervals.TNN) },
        { mileage: mileage.TNN, time: p.TNN }
      );
    }

    if (p.ZUY !== null) {
      schedule[trainNumber].push(
        { mileage: mileage.ZUY, time: p.ZUY }
      );
    }
  } else {
    if (p.ZUY !== null) {
      schedule[trainNumber].push(
        { mileage: mileage.ZUY, time: p.ZUY }
      );
    }

    if (p.TNN !== null) {
      schedule[trainNumber].push(
        { mileage: mileage.TNN, time: addMinutes(p.TNN, intervals.TNN) },
        { mileage: mileage.TNN, time: p.TNN }
      );
    }

    if (p.CHY !== null) {
      schedule[trainNumber].push(
        { mileage: mileage.CHY, time: addMinutes(p.CHY, intervals.CHY) },
        { mileage: mileage.CHY, time: p.CHY }
      );
    }

    if (p.YUL !== null) {
      schedule[trainNumber].push(
        { mileage: mileage.YUL, time: addMinutes(p.YUL, intervals.YUL) },
        { mileage: mileage.YUL, time: p.YUL }
      );
    }

    if (p.CHH !== null) {
      schedule[trainNumber].push(
        { mileage: mileage.CHH, time: addMinutes(p.CHH, intervals.CHH) },
        { mileage: mileage.CHH, time: p.CHH }
      );
    }

    if (trainType !== 5) {
      schedule[trainNumber].push(
        { mileage: mileage.TAC, time: addMinutes(p.TAC, intervals.TAC) }
      );
    }
    schedule[trainNumber].push(
      { mileage: mileage.TAC, time: p.TAC }
    );

    if (p.MIL !== null) {
      schedule[trainNumber].push(
        { mileage: mileage.MIL, time: addMinutes(p.MIL, intervals.MIL) },
        { mileage: mileage.MIL, time: p.MIL }
      );
    }

    if (p.HSC !== null) {
      schedule[trainNumber].push(
        { mileage: mileage.HSC, time: addMinutes(p.HSC, intervals.HSC) },
        { mileage: mileage.HSC, time: p.HSC }
      );
    }

    if (p.TAY !== null) {
      schedule[trainNumber].push(
        { mileage: mileage.TAY, time: addMinutes(p.TAY, intervals.TAY) },
        { mileage: mileage.TAY, time: p.TAY }
      );
    }

    if (p.BAQ !== null) {
      schedule[trainNumber].push(
        { mileage: mileage.BAQ, time: addMinutes(p.BAQ, intervals.BAQ) },
        { mileage: mileage.BAQ, time: p.BAQ }
      );
    }

    if (p.TPE !== null) {
      if (p.NAG !== null) {
        schedule[trainNumber].push(
          { mileage: mileage.TPE, time: addMinutes(p.TPE, intervals.TPE) }
        );
      }
      schedule[trainNumber].push(
        { mileage: mileage.TPE, time: p.TPE }
      );
    }

    if (p.NAG !== null) {
      schedule[trainNumber].push(
        { mileage: mileage.NAG, time: p.NAG }
      );
    }
  } // endif trainDirection

  schedule[trainNumber].columns = ["time", "mileage"];
  schedule[trainNumber].trainNumber = trainNumber;
  schedule[trainNumber].trainWeekdays = trainWeekdays;

  return schedule[trainNumber];
}).then(dataset => {
  // 畫折線
  dataset.forEach(data => {
    let trainNumber = data.trainNumber,
      trainType = parseInt(trainNumber / 100) % 10,
      isIrregular = parseInt(trainNumber / 1000) > 0,
      trainWeekdays = data.trainWeekdays.replace(/-+/g, "").replace("7", "0"),
      todayWeekday = d3.timeFormat('%w')(today),
      re = new RegExp(todayWeekday),
      currentPath = svg.append("path")
        .attr("stroke", colors[trainType])
        .attr("class", "line" + trainType)
        .attr("id", "path-" + trainNumber)
        .attr("d", valueline(data));

    // 如果今天沒開這台車，用虛線表示
    if (isIrregular && !re.test(trainWeekdays)) {
      currentPath.attr("stroke-dasharray", "2")
    }

    for (let i = 0; i < data.length - 1; i++) {
      let isDrawTrainNo = false;

      if (i === 0) {
        isDrawTrainNo = true;
      } else if (data[i].mileage === mileage.TAC && data[i + 1].mileage !== mileage.TAC) {
        isDrawTrainNo = true;
      }

      if (!isDrawTrainNo) {
        continue;
      }

      // 計算角度
      let angle = Math.atan2(
        y(data[i + 1].mileage) - y(data[i].mileage),
        x(data[i + 1].time) - x(data[i].time),
      ) * 180 / Math.PI;

      // 計算文字座標
      let xTextPosition = (x(data[i + 1].time) + x(data[i].time)) / 2,
        yTextPosition = (y(data[i + 1].mileage) + y(data[i].mileage)) / 2 - 3;

      // 加上車次資訊
      svg.append("text")
        .attr("stroke-width", 0)
        .attr("text-anchor", "middle")
        .attr(
          "transform",
          "translate(" + xTextPosition + ", " + yTextPosition + ") rotate(" + angle + ")"
        )
        .attr("class", "trainNumber")
        .attr("id", "text-" + trainNumber + "-" + i)
        .style("fill", colors[trainType])
        .text(trainNumber);
    }
  });
});
