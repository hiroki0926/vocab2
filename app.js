document.addEventListener('DOMContentLoaded', () => {
  const spreadsheetId = '1FzUB5-6KkG9MoGlI56j5x8DYl4xTs7G8WXJ4MDJzCjM'; // スプレッドシートIDを入力
  const range = 'Sheet1!A2:F'; // スプレッドシートの範囲

  const apiKey = process.env.REACT_APP_GOOGLE_API_KEY; // 環境変数からAPIキーを取得
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;

  const statusElement = document.getElementById('status');
  const quizCard = document.getElementById('quiz-card');
  const quizWord = document.getElementById('quiz-word');
  const quizOptions = document.getElementById('quiz-options');
  const quizResult = document.getElementById('quiz-result');
  const startQuizButton = document.getElementById('start-quiz');
  const nextQuestionButton = document.getElementById('next-question');

  let words = [];
  let currentQuizIndex = 0;
  let quizWords = [];

  $.getJSON(url, (data) => {
    statusElement.textContent = 'Google Spreadsheetとの連携に成功しました。';
    words = data.values;
  }).fail((jqxhr, textStatus, error) => {
    const err = textStatus + ", " + error;
    statusElement.textContent = 'Google Spreadsheetとの連携に失敗しました: ' + err;
  });

  startQuizButton.addEventListener('click', () => {
    const quizCount = parseInt(document.getElementById('quiz-count').value, 10);
    quizWords = getRandomWords(quizCount);
    currentQuizIndex = 0;
    quizCard.classList.remove('hidden');
    startQuizButton.classList.add('hidden');
    nextQuestion();
  });

  nextQuestionButton.addEventListener('click', nextQuestion);

  function nextQuestion() {
    quizResult.textContent = '';
    nextQuestionButton.classList.add('hidden');
    if (currentQuizIndex >= quizWords.length) {
      quizCard.classList.add('hidden');
      startQuizButton.classList.remove('hidden');
      return;
    }
    const randomWord = quizWords[currentQuizIndex];
    quizWord.textContent = randomWord[0];

    // 出題回数を更新
    updateSpreadsheet(randomWord[0], 4, parseInt(randomWord[3]) + 1);

    const options = shuffleArray([...words].map(word => word[1]).filter(opt => opt !== randomWord[1]));
    const correctAnswerIndex = Math.floor(Math.random() * 4);
    options.splice(correctAnswerIndex, 0, randomWord[1]);

    quizOptions.innerHTML = '';
    options.slice(0, 4).forEach(option => {
      const optionButton = document.createElement('button');
      optionButton.textContent = option;
      optionButton.addEventListener('click', () => {
        if (option === randomWord[1]) {
          optionButton.classList.add('correct');
          quizResult.textContent = 'Correct!';
          quizResult.style.color = 'green';

          // 正解回数を更新
          updateSpreadsheet(randomWord[0], 5, parseInt(randomWord[4]) + 1);
        } else {
          optionButton.classList.add('incorrect');
          quizResult.textContent = `Incorrect. The correct answer is "${randomWord[1]}".`;
          quizResult.style.color = 'red';
        }
        Array.from(quizOptions.children).forEach(button => {
          button.disabled = true;
          if (button.textContent === randomWord[1]) {
            button.classList.add('correct');
          }
        });
        nextQuestionButton.classList.remove('hidden');
        currentQuizIndex++;
      });
      quizOptions.appendChild(optionButton);
    });
  }

  function getRandomWords(count) {
    const shuffledWords = shuffleArray([...words]);
    return shuffledWords.slice(0, count);
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function updateSpreadsheet(word, columnIndex, value) {
    const rowIndex = words.findIndex(w => w[0] === word) + 2; // データは2行目から始まるため、インデックスを調整
    const range = `Sheet1!${String.fromCharCode(65 + columnIndex)}${rowIndex}`;
    const body = {
      values: [[value]]
    };

    $.ajax({
      url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED&key=${apiKey}`,
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(body),
      success: (response) => {
        console.log('Update successful:', response);
      },
      error: (response) => {
        console.error('Update failed:', response);
      }
    });
  }
});
