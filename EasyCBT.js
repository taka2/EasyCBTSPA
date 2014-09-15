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

  // 問題データに表示用インデックスを追加
  for(var i=0; i<copiedQuestions.length; i++) {
    copiedQuestions.displayIndex = j;
  }

  var bodyHTML = '';
  // テストタイトル
  bodyHTML += '<h1>' + examinationName + '</h1>';

  // テストデータ
  bodyHTML += '<form name="form1">';
  bodyHTML += '<ul class="questions">';

  for(var i=0; i<copiedQuestions.length; i++) {
    var question = copiedQuestions[i];
    bodyHTML += '<li>';
    bodyHTML += 'Q' + (i+1) + '. ' + question.description;
    bodyHTML += '<ul class="answers">';

    var answers = question.answers;
    for(var j=0; j<answers.length; j++) {
      var answer = answers[j];
      bodyHTML += '<li>';
      if(question.multiple_answer) {
        bodyHTML += '<input type="checkbox" name="answers' + (i+1) + '[' + question.index + ']" value="' + answer.index + '"> ' + answer.description;
      } else {
        bodyHTML += '<input type="radio" name="answers' + (i+1) + '[' + question.index + ']" value="' + answer.index + '"> ' + answer.description;
      }
      bodyHTML += '</li>';
    }
    bodyHTML += '</ul>';
    bodyHTML += '</li>';
  }
  bodyHTML += '</ul>';
  bodyHTML += '<input type="button" name="finish" value="Finish" onClick="finish_onClick()">'
  bodyHTML += '</form>';
  document.body.innerHTML = bodyHTML;
}

// Finishボタンイベントハンドラ
function finish_onClick() {
  // 答え合わせ
  var bodyHTML = '';

  bodyHTML += '<h1>' + examinationName + '</h1>';
  bodyHTML += '<ul class="questions">';
  var index = 0;
  var correctAnswersCount = 0;
  for(var k=0; k<questionCount; k++) {
    // "answers(k+1)["で始まる要素を取得
    var elem = $("input[name ^= 'answers" + (k+1) + "\[']");

    // 問題を特定
    var questionNumber = extractNumber(elem[0].name);
    var question = questions[questionNumber];
    bodyHTML += '<li>';
    bodyHTML += 'Q' + (++index) + '. ' + question.description + '';

    bodyHTML += '<ul class="results">';
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

      if(correct) {
        // 正解
        bodyHTML += '<li>正解！</li>';
        correctAnswersCount++;
      } else {
        // 不正解
        bodyHTML += '<li>不正解。。</li>';
      }
      bodyHTML += '<li>回答: ' + concatAnswersDescription(answers) + '</li>';
      bodyHTML += '<li>正解: ' + concatAnswersDescription(correctAnswers) + '</li>';
    } else {
      // ラジオボタンの場合
      var radioButtonValue = elem.filter(":checked").val();
      var answerNumber = Number(radioButtonValue);
      var answer = question.answers[answerNumber];
      var correctAnswer = getCorrectAnswers(question)[0];

      if((radioButtonValue != undefined) && answer.correct) {
        // 正解
        bodyHTML += '<li>正解！</li>';
        correctAnswersCount++;
      } else {
        // 不正解
        bodyHTML += '<li>不正解。。</li>';
      }
      bodyHTML += '<li>回答: ' + ((radioButtonValue != undefined) ? answer.description : '') + '</li>';
      bodyHTML += '<li>正解: ' + correctAnswer.description + '</li>';
    }
    bodyHTML += '</ul>';
    bodyHTML += '</li>';
  }
  bodyHTML += '</ul>';

  // 成績
  bodyHTML += '<p class="record">';
  bodyHTML += questionCount + '問中' + correctAnswersCount + '問正解でした。<br/>正答率=' + calcPercentageOfCorrectAnswers(questionCount, correctAnswersCount) + '%';
  bodyHTML += '</p>';

  // 戻るリンク
  bodyHTML += '<p class="back">';
  bodyHTML += '<a href = "javascript:location.reload();">戻る</a>';
  bodyHTML += '</p>';
  document.body.innerHTML = bodyHTML;
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
