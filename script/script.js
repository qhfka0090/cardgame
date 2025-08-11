const gameBoard = document.querySelector('#game-board');
    const timerDisplay = document.querySelector('#timer');
    const levelDisplay = document.querySelector('#level');
    const startButton = document.querySelector('#start-button');
    const messageDisplay = document.querySelector('#message');
    
    let cards = []; // 카드 배열
    let flippedCards = []; // 뒤집힌 카드 저장 배열 -- 2개까지만 저장
    let matchedPairs = 0;  // 맞힌 짝 개수
    let lockBoard = false;  // 카드 클릭 제어
    let timer = 50;
    let timerInterval;    
    let currentLevel = 1;   //1, 2, 3 

    const cardFaceMap = {
      'card1': 'images/card1.png', 'card2': 'images/card2.png', 'card3': 'images/card3.png',
      'card4': 'images/card4.png', 'card5': 'images/card5.png', 'card6': 'images/card6.png',
      'card7': 'images/card7.png', 'card8': 'images/card8.png', 'card9': 'images/card9.png',
      'card10': 'images/card10.png', 'nextCard1': 'images/nextCard1.png', 'nextCard2': 'images/nextCard2.png',
      'nextCard3': 'images/nextCard3.png', 'nextCard4': 'images/nextCard4.png', 'nextCard5': 'images/nextCard5.png',
      'nextCard6': 'images/nextCard6.png', 'nextCard7': 'images/nextCard7.png', 'nextCard8': 'images/nextCard8.png',
      'nextCard9': 'images/nextCard9.png', 'nextCard10': 'images/nextCard10.png',
      'nextCard11': 'images/nextCard11.png', 'nextCard12': 'images/nextCard12.png',
      'nextCard13': 'images/nextCard13.png', 'nextCard14': 'images/nextCard14.png', 'nextCard15': 'images/nextCard15.png',
      'nextCard16': 'images/nextCard16.png', 'nextCard17': 'images/nextCard17.png', 'nextCard18': 'images/nextCard18.png',
      'nextCard19': 'images/nextCard19.png', 'nextCard20': 'images/nextCard20.png'
    };

    const cardBackImage = 'images/cardbackfade.png';
    //게임 초기화 함수 1, 2, 3레벨
    function initializeGame(level){
      currentLevel = level;
      matchedPairs = 0;
      flippedCards = [];
      lockBoard = false;
      timer = 50;
      messageDisplay.textContent = '';
      gameBoard.innerHTML = '';
      let cardNames, boardClass, levelText;

      if( level===1 ){
        cardNames = Array.from({length:6}, (_,i)=> `card${i+1}` );
        boardClass = 'game-board-12';
        levelText = '1단계 : 6개 짝 맞추기';
      } else if( level===2 ){
        cardNames = Array.from({length:10}, (_,i)=> `card${i+1}` );
        boardClass = 'game-board-20';
        levelText = '2단계 : 10개 짝 맞추기';
      } else {
        // [...Array.from(length:10, card{i+1}), ...Array.from(length:10, nextCard{i+1})]
        cardNames = Array.from({length:20}, (_,i)=> `nextCard${i+1}` );
        boardClass = 'game-board-40';
        levelText = '3단계 : 20개 짝 맞추기';
      }

      gameBoard.className = '';
      gameBoard.classList.add(boardClass);
      levelDisplay.textContent = levelText;
      cards = [...cardNames, ...cardNames];
      shuffleCards();
      createCards();
      setTimeout(()=>{
        document.querySelectorAll('.card').forEach(card=>card.classList.add('flipped'));
        setTimeout(()=>{
          document.querySelectorAll('.card').forEach(card=>card.classList.remove('flipped'));
          startTimer();
        }, 2000);
      }, 500)
    }

    //카드 무작위 셔플 함수 -- Fisher-Yates 알고리즘
    function shuffleCards(){
      for(let i=cards.length-1; i>0; i--){
        const j = Math.floor(Math.random()*(i+1));
        [cards[i], cards[j]] = [cards[j], cards[i]]
      }
    }

    //카드 생성 함수
    function createCards(){
      cards.forEach((cardName, index)=>{
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.cardName = cardName; // <div data-cardName="card1"
        cardElement.dataset.index = index;
        cardElement.innerHTML = `
          <div class="card-face card-front">
              <img src="${cardFaceMap[cardName]}" alt="${cardName}">
          </div>
          <div class="card-face card-back">
              <img src="${cardBackImage}" alt="Card Back">
          </div>
        `;
        cardElement.addEventListener('click', flipCard);
        gameBoard.appendChild(cardElement);
      })
    }

    //카드 뒤집는 함수(클릭) -- 클릭요소 this로 구분
    function flipCard(){
      //보드lock설정, 뒤집힌카드, 매칭된 카드==> 실행안됨 
      if(lockBoard || this.classList.contains('flipped') || this.classList.contains('matched')) return;
      if( flippedCards.length<2 && this != flippedCards[0] ){
        this.classList.add('flipped'); //카드 뒤집기
        flippedCards.push(this);
      }
      if( flippedCards.length==2 ){
        lockBoard = true; // 추가 클릭 방지
        checkForMatch(); // 매칭 검사
      }
    }

    //카드 매칭 함수
    function checkForMatch(){
      const [card1, card2] = flippedCards;
      const isMatch = card1.dataset.cardName === card2.dataset.cardName;
      if( isMatch ){
        disableCards(); // 매칭된 카드 비활성화
      } else {
        setTimeout(()=>{
          card1.classList.remove('flipped');
          card2.classList.remove('flipped');
          resetBoard(); //보드 상태 리셋( lockBoard... 처리 )
        }, 800);
      }
    }

    //매치된 카드 처리 함수
    function disableCards(){
      const [card1, card2] = flippedCards; //매칭된 두 카드 지정
      card1.removeEventListener('click', flipCard);
      card2.removeEventListener('click', flipCard); // 클릭 이벤트 리스터 제거(클릭이벤트제거)
      setTimeout(()=>{
        card1.classList.add('matched'); // 페이드아웃 효과 클래스 적용
        card2.classList.add('matched');
      },500);
      matchedPairs++; // 매칭 짝 개수 증가
      resetBoard();   // 보드 상태 리셋
      //모든 카드가 매칭되었는지 체크
      if(matchedPairs*2 === cards.length){
        clearInterval(timerInterval); //타이머 중지
        messageDisplay.textContent = '모든 카드를 찾았습니다.';
        if( currentLevel===1 ){
          messageDisplay.textContent += '2단계로 넘어갑니다!!!';
          setTimeout(()=> initializeGame(2), 2000 );
        } else if( currentLevel===2 ){
          messageDisplay.textContent += '3단계로 넘어갑니다!!!';
          setTimeout(()=> initializeGame(3), 2000 );
        } else {
          messageDisplay.textContent += '모든 단계 클리어! 축하합니다.';
          startButton.style.display = 'block'; // 재시작 버튼
        }
      }
    }

    //리셋 함수
    function resetBoard(){
      flippedCards = []; //뒤집힌 카드 담는 배열 초기화
      lockBoard = false; //잠금 해제
    }

    //타이머 시작함수
    function startTimer(){
      clearInterval(timerInterval);
      timerDisplay.textContent = `남은 시간 : ${timer}초`;
      timerInterval = setInterval(()=>{
        timer--;
        timerDisplay.textContent = `남은 시간 : ${timer}초`;
        if( timer<=0 ){
          clearInterval(timerInterval);
          lockBoard = true;
          messageDisplay.textContent = '시간 초과! 게임 오버~!!';
          startButton.style.display = 'block'; //재시작
        }
      }, 1000)
    }

    //시작버튼 이벤트
    startButton.addEventListener('click', ()=>{
      startButton.style.display = 'none';
      initializeGame(1);
    });
    //초기화 실행
    //initializeGame(1);
    clearInterval(timerInterval);
    timerDisplay.textContent = '남은 시간:50초';