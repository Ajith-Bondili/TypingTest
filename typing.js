const words = `There once was a shepherd boy who was bored as he sat on the hillside watching the village sheep. To amuse himself he took a great breath and sang out, "Wolf! Wolf! The Wolf is chasing the sheep!" The villagers came running up the hill to help the boy drive the wolf away. But when they arrived at the top of the hill, they found no wolf. The boy laughed at the sight of their angry faces. "Don't cry 'wolf', shepherd boy," said the villagers, "when there's no wolf!" They went grumbling back down the hill. Later, the boy sang out again, "Wolf! Wolf! The wolf is chasing the sheep!" To his naughty delight, he watched the villagers run up the hill to help him drive the wolf away.`. split(' ');
const wordsCount = words.length;
const gameTime = 30 * 1000;
window.timer = null;
window.gameStart =  null;

function addClass(el,name){
    el.className += ' '+name
}

function removeClass(el,name){
    el.className = el.className.replace(name,'');

}

function randomWord(){
    const randomIndex = Math.floor(Math.random() * wordsCount);
    return words[randomIndex];
}

function formatWord(word){
    return `<div class='word'><span class="letter">${word.split('').join('</span><span class="letter">')}</span></div>`;
}

function newGame(){
    clearInterval(window.timer);

    document.getElementById('words').innerHTML = '';
    for (let i = 0; i< 200; i++){
        document.getElementById('words').innerHTML += formatWord(randomWord());
    }
    addClass(document.querySelector('.word'),'current');
    addClass(document.querySelector('.letter'),'current');
    document.getElementById('info').innerHTML = (gameTime / 1000) + '';
    window.timer = null;
    window.gameStart = null;
    removeClass(document.getElementById('game'), 'over');

}

function getWpm(){
    const words = [...document.querySelectorAll('.word')];
    const lastTypedWord = document.querySelector('.word.current');
    const lastTypedWordIndex = words.indexOf(lastTypedWord);
    const typedWords = words.slice(0, lastTypedWordIndex);
    const correctWords = typedWords.filter(word => {
        const letters = [...word.children];
        const incorrectLetters = letters.filter(letter => letter.className.includes('incorrect'));
        const correctLetters = letters.filter(letter => letter.className.includes('correct'));
        return incorrectLetters.length === 0 && correctLetters.length === letters.length
    });
    return correctWords.length / gameTime * 60000;
}

function gameOver(){
    clearInterval(window.timer);
    addClass(document.getElementById('game'),'over');
    const result = getWpm();
    document.getElementById('info').innerHTML = `WPM: ${getWpm()}`;
}

document.getElementById('game').addEventListener('keyup',event => {
    const key = event.key;
    const currentWord= document.querySelector('.word.current')
    const currentLetter = document.querySelector('.letter.current');
    const expected = currentLetter?.innerHTML || ' ';
    const isLetter = key.length === 1 && key!== ' ';
    const isSpace = key ===' ';
    const isBackspace = key === 'Backspace';
    const isFirstLetter = currentLetter === currentWord.firstChild;


    if(document.querySelector('#game.over')){
    return;
    }

    console.log({key,expected});

    if (!window.timer && isLetter){
        window.timer = setInterval(()=> {
            if (!window.gameStart){
                window.gameStart = (new Date()).getTime();
            }
            const currentTime = (new Date()).getTime();
            const msPassed = currentTime - window.gameStart;
            const sPassed = Math.round(msPassed/1000);
            const sLeft = (gameTime / 1000) - sPassed;
            if (sLeft <=  0){
                gameOver();
                return;
            }
            document.getElementById('info').innerHTML = sLeft + '';
        }, 1000); 

    }


    if (isLetter){
        if (currentLetter){
            addClass(currentLetter, key === expected ? 'correct' : 'incorrect');
            removeClass(currentLetter,'current');
            if(currentLetter.nextSibling){
            addClass(currentLetter.nextSibling,'current');
            }
        }
        else{
            const incorrectLetter= document.createElement('span');
            incorrectLetter.innerHTML = key;
            incorrectLetter.className = 'letter incorrect extra';
            currentWord.appendChild(incorrectLetter);
        }
    }
    if(isSpace){
        if (expected !== ' '){
            const lettersToInvalidate = [...document.querySelectorAll('.word.current .letter:not(.correct)')];
            lettersToInvalidate.forEach(letter => {
                addClass(letter,'incorrect');
            });
        }
        removeClass(currentWord,'current');
        addClass(currentWord.nextSibling, 'current');
        if(currentLetter){
            removeClass(currentLetter,'current');
        }
        addClass(currentWord.nextSibling.firstChild, 'current');
    }

    if (isBackspace){
        const extraLetters = currentWord.querySelectorAll('.extra');
    if (extraLetters.length > 0) {
        currentWord.removeChild(extraLetters[extraLetters.length - 1]);
    } else{
        if(currentLetter && isFirstLetter) {
            //make prev word current, last letter current
            removeClass(currentWord, 'current');
            addClass(currentWord.previousSibling, 'current');
            removeClass(currentLetter, 'current');
            addClass(currentWord.previousSibling.lastChild, 'current');
            removeClass(currentWord.previousSibling.lastChild, 'incorrect');
            removeClass(currentWord.previousSibling.lastChild, 'correct');

        }
        if(currentLetter && !isFirstLetter){
            //move back one letter, invalidate letter 
            removeClass(currentLetter, 'current');
            addClass(currentLetter.previousSibling, 'current');
            removeClass(currentLetter.previousSibling, 'incorrect');
            removeClass(currentLetter.previousSibling, 'correct');
        }
        if(!currentLetter){
            addClass(currentWord.lastChild, 'current');
            removeClass(currentWord.lastChild, 'incorrect');
            removeClass(currentWord.lastChild, 'correct');
        }
    }
    }
    //move lines, words
    if(currentWord.getBoundingClientRect().top > 250){
        const words = document.getElementById('words');
        const margin = parseInt(words.style.marginTop || '0px');
        words.style.marginTop = (margin - 35) + 'px';

    }

    //move cursor
    const nextLetter = document.querySelector('.letter.current');
    const nextWord =  document.querySelector('.word.current');
    const cursor = document.getElementById('cursor');
    cursor.style.top = (nextLetter || nextWord).getBoundingClientRect().top + 3 + 'px';
    cursor.style.left = (nextLetter || nextWord).getBoundingClientRect()[nextLetter ? 'left':'right'] + 'px';
   
})

document.getElementById('newGameBtn').addEventListener('click', ()=>{
    window.location.reload();
});

newGame();