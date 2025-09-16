// 슬롯/카드 데이터
const SLOT_COUNT = 36;
const CARD_COUNT = 12;
const boardGrid = document.querySelector('.board-grid');
const titleText = document.getElementById('title-text');

// 영역 구분: 1영역(1~12), 2영역(13~24), 3영역(25~36)
function getArea(idx) {
	if (idx < 12) return 1;
	if (idx < 24) return 2;
	return 3;
}

// 카드 데이터: 숫자, 패턴
const cards = Array.from({length: CARD_COUNT}, (_, i) => ({
	number: i+1,
	pattern: `pattern${(i+1).toString().padStart(2, '0')}` // pattern01~pattern12
}));

// 카드 상태: 앞면/뒷면
let cardFace = Array(CARD_COUNT).fill('front'); // 'front' or 'back'

// 셀별 배경이미지(선생님 모드용)
let cellImages = Array(SLOT_COUNT).fill(null); // null or 'card (1).png'~'card (24).png' or 'answer.png'
// 1,2영역에 기본값 배경이미지(card (1).png~card (24).png) 자동 배치
for (let i=0; i<24; i++) {
	cellImages[i] = `card (${i+1}).png`;
}

// 선생님 모드 상태
let teacherMode = false;
let selectedPaletteImg = null;

// 슬롯 상태: 카드가 들어간 슬롯 인덱스 (없으면 null)
let slots = Array(SLOT_COUNT).fill(null);
// 카드 12개를 3영역(25~36)에 순서대로 배치
for (let i=0; i<CARD_COUNT; i++) {
	slots[24+i] = i; // 카드 인덱스
}

// 렌더링
function renderBoard() {
	boardGrid.innerHTML = '';
	for (let i=0; i<SLOT_COUNT; i++) {
		const slotDiv = document.createElement('div');
		slotDiv.className = 'slot';
		slotDiv.dataset.idx = i;
		slotDiv.dataset.area = getArea(i);
		// 셀 배경이미지(선생님 모드)
		if (cellImages[i]) {
			slotDiv.style.background = `#fff url('images/quiz${window.quizNum}/${cellImages[i]}') center/cover no-repeat`;
		} else {
			slotDiv.style.background = '';
		}
		// 카드가 있으면 렌더링
		if (slots[i] !== null) {
			const cardIdx = slots[i];
			const card = cards[cardIdx];
			const cardDiv = document.createElement('div');
			cardDiv.className = 'card';
			cardDiv.draggable = true;
			cardDiv.dataset.cardIdx = cardIdx;
			// 3영역 & 뒷면이면 이미지로 표시
			if (getArea(i) === 3 && cardFace[cardIdx] === 'back') {
				cardDiv.style.background = `#fff url('images/${card.pattern}.png') center/cover no-repeat`;
				cardDiv.textContent = '';
			} else {
				cardDiv.textContent = card.number+".";
				cardDiv.style.background = '';
			}
			slotDiv.appendChild(cardDiv);
		}
		boardGrid.appendChild(slotDiv);
	}
	// 제목 업데이트
	titleText.textContent = `미니루크 퀴즈 ${window.quizNum}`;
}

// 카드 이동: 클릭 방식
let selectedCardIdx = null;
let selectedSlotIdx = null;

boardGrid.addEventListener('click', function(e) {
	const slotDiv = e.target.closest('.slot');
	if (!slotDiv) return;
	const idx = Number(slotDiv.dataset.idx);
	const area = getArea(idx);
	// 카드 선택
	if (slots[idx] !== null) {
		const cardIdx = slots[idx];
		// 뒷면(그림) 타일은 선택 불가
		if (cardFace[cardIdx] === 'back') return;
		// 숫자(앞면) 타일만 선택
		selectedCardIdx = cardIdx;
		selectedSlotIdx = idx;
		document.querySelectorAll('.card').forEach(card => card.classList.remove('selected-card'));
		// 선택된 카드에 배경색 표시
		const cardDiv = slotDiv.querySelector('.card');
		if (cardDiv) cardDiv.classList.add('selected-card');
	} else if (selectedCardIdx !== null) {
		// 빈 슬롯 클릭: 이동 시도
		if (area === 1) {
			alert('1영역에는 카드를 놓을 수 없습니다!');
			return;
		}
		// 이동
		slots[selectedSlotIdx] = null;
		slots[idx] = selectedCardIdx;
		// 이동 시 앞면으로 복원
		cardFace[selectedCardIdx] = 'front';
		selectedCardIdx = null;
		selectedSlotIdx = null;
		document.querySelectorAll('.card').forEach(card => card.classList.remove('selected-card'));
		renderBoard();
	}
});


// 뒤집기 버튼 기능
const flipBtn = document.getElementById('flip-btn');
flipBtn.addEventListener('click', function() {
	// 2영역 슬롯 인덱스: 12~23
	const area2Slots = Array.from({length: 12}, (_, i) => 12+i);
	// 3영역 슬롯 인덱스: 24~35
	const area3Slots = Array.from({length: 12}, (_, i) => 24+i);

	// 2영역에 카드가 모두 존재하는지 확인
	const cardsInArea2 = area2Slots.map(idx => slots[idx]).filter(idx => idx !== null);
	// 3영역에 카드가 모두 존재하는지 확인
	const cardsInArea3 = area3Slots.map(idx => slots[idx]).filter(idx => idx !== null);
	const allBackInArea3 = cardsInArea3.length === CARD_COUNT && cardsInArea3.every(cardIdx => cardFace[cardIdx] === 'back');

	if (cardsInArea2.length === CARD_COUNT) {
		// 기존 뒤집기: 2영역 → 3영역, 뒷면
		for (let i=0; i<6; i++) {
			const fromIdx = 12+i;   // 13~18
			const toIdx = 30+i;     // 31~36
			slots[toIdx] = slots[fromIdx];
			if (slots[fromIdx] !== null) {
				cardFace[slots[fromIdx]] = 'back';
			}
			slots[fromIdx] = null;
		}
		for (let i=0; i<6; i++) {
			const fromIdx = 18+i;   // 19~24
			const toIdx = 24+i;     // 25~30
			slots[toIdx] = slots[fromIdx];
			if (slots[fromIdx] !== null) {
				cardFace[slots[fromIdx]] = 'back';
			}
			slots[fromIdx] = null;
		}
		renderBoard();
		return;
	}

	if (allBackInArea3) {
		// 3영역에 모두 뒷면이면 → 2영역으로 이동, 앞면
		for (let i=0; i<6; i++) {
			const fromIdx = 30+i;   // 31~36
			const toIdx = 12+i;     // 13~18
			slots[toIdx] = slots[fromIdx];
			if (slots[fromIdx] !== null) {
				cardFace[slots[fromIdx]] = 'front';
			}
			slots[fromIdx] = null;
		}
		for (let i=0; i<6; i++) {
			const fromIdx = 24+i;   // 25~30
			const toIdx = 18+i;     // 19~24
			slots[toIdx] = slots[fromIdx];
			if (slots[fromIdx] !== null) {
				cardFace[slots[fromIdx]] = 'front';
			}
			slots[fromIdx] = null;
		}
		renderBoard();
		return;
	}

	alert('모든 카드가 2영역 또는 3영역(뒷면)에 있어야 뒤집을 수 있습니다!');
});

// 최초 렌더링
renderBoard();

// 선생님 모드 UI 생성
function renderTeacherUI() {
	const teacherUI = document.getElementById('teacher-ui');
	teacherUI.style.display = teacherMode ? 'flex' : 'none';
	// 팔레트 생성
	const paletteDiv = document.getElementById('palette');
	paletteDiv.innerHTML = '';
	const exts = ['png', 'jpg', 'jpeg'];
	for (let i=1; i<=24; i++) {
		let srcBase = `images/quiz${window.quizNum}/card (${i})`;
		let img = document.createElement('img');
		img.className = 'palette-img';
		img.dataset.img = '';
		let extIdx = 0;
		function tryLoad(extIdx) {
			if (extIdx >= exts.length) {
				img.style.display = 'none';
				return;
			}
			let src = `${srcBase}.${exts[extIdx]}`;
			img.src = src;
			img.dataset.img = `card (${i}).${exts[extIdx]}`;
			img.onerror = function() {
				tryLoad(extIdx+1);
			};
		}
		tryLoad(0);
		if (selectedPaletteImg === img.dataset.img) img.classList.add('selected');
		img.addEventListener('click', () => {
			selectedPaletteImg = img.dataset.img;
			renderTeacherUI();
			document.getElementById('selected-img').src = img.src;
		});
		paletteDiv.appendChild(img);
	}
	// 지우개
	const eraser = document.createElement('img');
	eraser.src = 'images/eraser.png';
	eraser.className = 'palette-img';
	eraser.dataset.img = 'eraser';
	if (selectedPaletteImg === 'eraser') eraser.classList.add('selected');
	eraser.addEventListener('click', () => {
		selectedPaletteImg = 'eraser';
		renderTeacherUI();
		document.getElementById('selected-img').src = eraser.src;
	});
	paletteDiv.appendChild(eraser);
	// 선택된 그림
	const selectedImg = document.getElementById('selected-img');
	if (selectedPaletteImg && selectedPaletteImg !== 'eraser') {
		selectedImg.src = `images/quiz${window.quizNum}/${selectedPaletteImg}`;
	} else if (selectedPaletteImg === 'eraser') {
		selectedImg.src = `images/quiz${window.quizNum}/eraser.png`;
	} else {
		selectedImg.src = '';
	}
}

// 선생님 모드 토글 버튼
const teacherBtn = document.getElementById('teacher-toggle-btn')
teacherBtn.addEventListener('click', function() {
	teacherMode = !teacherMode;
	if (teacherMode) {
		teacherBtn.classList.add('pressed');
	} else {
		teacherBtn.classList.remove('pressed');
	}
	renderTeacherUI();
});

// 로비 버튼
document.getElementById('lobby-btn').addEventListener('click', function() {
	window.location.href = 'stage.html';
});

// 셀 클릭 시 그림 배치 (선생님 모드)
boardGrid.addEventListener('click', function(e) {
	if (!teacherMode) return;
	const slotDiv = e.target.closest('.slot');
	if (!slotDiv) return;
	const idx = Number(slotDiv.dataset.idx);
	const area = getArea(idx);
	// 1,2영역만 그림 배치 가능
	if (area !== 1 && area !== 2) return;
	if (!selectedPaletteImg) return;
	if (selectedPaletteImg === 'eraser') {
		cellImages[idx] = null;
	} else {
		cellImages[idx] = selectedPaletteImg;
	}
	renderBoard();
});

// 뒤집기 버튼 클릭 시 answer와 비교 지표 표시
document.getElementById('flip-btn').addEventListener('click', function() {
	if (teacherMode) {
		// 예시: 1,2영역 셀의 이미지가 answer와 일치하는지 비교
		// 실제 비교 로직은 answer.png의 정답 데이터 필요
		// 여기선 단순히 1,2영역에 이미지가 모두 채워져 있으면 '일치'로 표시
		const areaSlots = Array.from({length:24},(_,i)=>i);
		const allFilled = areaSlots.every(idx => cellImages[idx]);
		const indicator = document.getElementById('answer-indicator');
		if (allFilled) {
			indicator.textContent = '정답과 일치!';
			indicator.style.color = '#28a745';
		} else {
			indicator.textContent = '정답과 다름';
			indicator.style.color = '#dc3545';
		}
	}
});

// 최초 UI 렌더링
renderTeacherUI();
