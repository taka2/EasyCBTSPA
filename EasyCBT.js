// Arrayクラスを拡張
// （参考）Will It Shuffle?<
// http://bost.ocks.org/mike/shuffle/compare.html
Array.prototype.shuffle = function() {
  return this.sort(function() {
    return Math.random() - .5;
  });
};

// 画面初期表示イベントハンドラ
function body_onLoad() {
  // 問題データの（シャッフル前）オリジナルインデックスを保存
  for(var i=0; i<questions.length; i++) {
    questions[i].index = i;
    var answers = questions[i].answers;
    for(var j=0; j<answers.length; j++) {
      answers[j].index = j;
    }
  }

  // 問題をシャッフルして、指定数だけ取り出す
  var copiedQuestions = questions.concat();
  copiedQuestions = copiedQuestions.shuffle().slice(0, questionCount);

  // 問題ページを描画
  document.getElementById("rendering_area").innerHTML = tmpl("questions_template", {examinationName: examinationName, questions: copiedQuestions});
}

// Finishボタンイベントハンドラ
function finish_onClick() {
  // 答え合わせ
  var correctAnswersCount = 0;
  var copiedQuestions = [];
  for(var k=0; k<questionCount; k++) {
    // "answers(k+1)["で始まる要素を取得
    var elem = $("input[name ^= 'answers" + (k+1) + "\[']");

    // 問題を特定
    var questionNumber = extractNumber(elem[0].name);
    var question = $.extend(true, {}, questions[questionNumber]);

    if(question.multiple_answer) {
      // チェックボックスの場合
      var answers = [];
      var correct = true;
      for(var i=0; i<elem.length; i++) {
        if(elem[i].checked) {
          var answerNumber = Number(elem[i].value);
          var answer = question.answers[answerNumber];
          correct = correct && answer.correct;
          answers.push(answer);
        }
      }
      if(answers.length == 0){
        // 選択なしの場合は不正解とする
        correct = false;
      }
      var correctAnswers = getCorrectAnswers(question);
      if(answers.length != correctAnswers.length) {
        // 回答数と正解数があわない場合は不正解とする
        correct = false;
      }
    } else {
      // ラジオボタンの場合
      var answers = [];
      var correct = false;
      var radioButtonValue = elem.filter(":checked").val();
      if(radioButtonValue != undefined) {
        var answerNumber = Number(radioButtonValue);
        var answer = question.answers[answerNumber];
        correct = answer.correct;
        answers.push(answer);
      }
      var correctAnswers = getCorrectAnswers(question);
    }

    // questionオブジェクトに正否、回答、解答をセット
    question.correct = correct;
    question.correctAnswers = correctAnswers;
    question.selectedAnswers = answers;
    if(question.correct) {
      correctAnswersCount++;
    }
    copiedQuestions.push(question);
  }

  // 結果ページを描画
  document.getElementById("rendering_area").innerHTML = tmpl("result_template", {
    examinationName: examinationName
    , questions: copiedQuestions
    , questionCount: questionCount
    , correctAnswersCount : correctAnswersCount
  });
}

// answers[x]の文字列からxを取り出す
function extractNumber(answersString) {
  var result = answersString.match(/answers.+\[(.*)\]/);
  return Number(result[1]);
}

// question配列から正解オブジェクトを取り出す
function getCorrectAnswers(question) {
  var result = [];
  for(var i=0; i<question.answers.length; i++) {
    var answer = question.answers[i];
    if(answer.correct) {
      result.push(answer);
    }
  }

  return result;
}

// answers配列のdescriptionを改行でつないだ文字列を返す
function concatAnswersDescription(answers) {
  if(answers.length == 1) {
    // 1件の場合は加工せず返す
    return answers[0].description;
  }

  // 複数件の場合は加工して返す
  var resultStringArray = [];
  for(var i=0; i<answers.length; i++) {
    resultStringArray.push("(" + (i+1) + ") " + answers[i].description);
  }

  return resultStringArray.join(' ');
}

// 正答率を計算する
function calcPercentageOfCorrectAnswers(questionCount, correctAnswersCount) {
  var percentage = (correctAnswersCount / questionCount * 100);
  // 小数点第2位まで表示（切り捨て）
  return (Math.floor(percentage * 100) / 100);
}
