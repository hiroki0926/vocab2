document.addEventListener('DOMContentLoaded', () => {
  const spreadsheetId = '1FzUB5-6KkG9MoGlI56j5x8DYl4xTs7G8WXJ4MDJzCjM'; // スプレッドシートIDを入力
  const range = 'Sheet1!A2:C'; // スプレッドシートの範囲

  const apiKey = process.env.REACT_APP_GOOGLE_API_KEY; // 環境変数からAPIキーを取得
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;

  const searchInput = document.getElementById('search-input');
  const wordList = document.getElementById('word-list');

  let words = [];

  $.getJSON(url, (data) => {
    words = data.values;
    displayWordList(words);
  }).fail((jqxhr, textStatus, error) => {
    const err = textStatus + ", " + error;
    document.getElementById('status').textContent = 'Google Spreadsheetとの連携に失敗しました: ' + err;
  });

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredWords = words.filter(word => word[0].toLowerCase().includes(searchTerm) || word[1].toLowerCase().includes(searchTerm));
    displayWordList(filteredWords);
  });

  function displayWordList(words) {
    wordList.innerHTML = '';
    words.forEach(word => {
      const wordItem = document.createElement('div');
      wordItem.className = 'word-item';
      
      const wordText = document.createElement('div');
      wordText.className = 'word';
      wordText.textContent = word[0];

      const meaningText = document.createElement('div');
      meaningText.className = 'meaning';
      meaningText.textContent = word[1];

      const exampleText = document.createElement('div');
      exampleText.className = 'example';
      exampleText.textContent = word[2];

      wordItem.appendChild(wordText);
      wordItem.appendChild(meaningText);
      wordItem.appendChild(exampleText);
      
      wordItem.addEventListener('click', () => {
        meaningText.style.display = meaningText.style.display === 'none' ? 'block' : 'none';
        exampleText.style.display = exampleText.style.display === 'none' ? 'block' : 'none';
      });

      wordList.appendChild(wordItem);
    });
  }
});
