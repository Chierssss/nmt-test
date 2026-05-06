let block = Number(localStorage.getItem("block")) || 1;
let current = Number(localStorage.getItem("current")) || 0;
let answers = JSON.parse(localStorage.getItem("answers")) || {};

let currentQuestions = blocks[block];

let duration = 120 * 60;

let blockKey = "timeLeft_block_" + block;

let timeLeft = Number(localStorage.getItem(blockKey)) || duration;

let timerInterval;

let currentSubject = currentQuestions[0]?.sub;



const mathTable = {
5:100,6:108,7:115,8:123,9:131,10:134,
11:137,12:140,13:143,14:145,15:147,
16:148,17:149,18:150,19:151,20:152,
21:155,22:159,23:163,24:167,25:170,
26:173,27:176,28:180,29:184,30:189,
31:194,32:200
};

const ukrTable = {
7:100,8:105,9:110,10:115,11:120,
12:125,13:131,14:134,15:136,
16:138,17:140,18:142,19:143,
20:144,21:145,22:146,23:148,
24:149,25:150,26:152,27:154,
28:156,29:157,30:159,31:160,
32:162,33:163,34:165,35:167,
36:170,37:172,38:175,39:177,
40:180,41:183,42:186,43:191,
44:195,45:200
};

const historyTable = {
8:100,9:105,10:111,11:116,12:120,
13:124,14:127,15:130,16:132,
17:134,18:136,19:138,20:140,
21:141,22:142,23:143,24:144,
25:145,26:146,27:147,28:148,
29:149,30:150,31:151,32:152,
33:154,34:156,35:158,36:160,
37:163,38:166,39:168,40:169,
41:170,42:172,43:173,44:175,
45:177,46:179,47:181,48:183,
49:185,50:188,51:191,52:194,
53:197,54:200
};

const engTable = {
5:100,6:109,7:118,8:125,9:131,
10:134,11:137,12:140,13:143,14:145,
15:147,16:148,17:149,18:150,19:151,
20:152,21:153,22:155,23:157,24:159,
25:162,26:166,27:169,28:173,29:179,
30:185,31:191,32:200
};

const minScores = {
    "Математика": 5,
    "Українська мова": 7,
    "Історія": 8,
    "Англійська мова": 5
};

function convertToNMT(sub, score){

    if(sub === "Математика"){
        return mathTable[score] || 100;
    }

    if(sub === "Українська мова"){
        return ukrTable[score] || 100;
    }

    if(sub === "Історія"){
        return historyTable[score] || 100;
    }

    if(sub === "Англійська мова"){
        return engTable[score] || 100;
    }

    return 100;
}

// INIT
if(document.getElementById("question")){
    startTimer();
    buildSubjects();
    show();
}



if(document.getElementById("errors")){
    showErrors();
}

// --------------------
// TIMER
// --------------------
function startTimer(){

    let blockKey = "timeLeft_block_" + block;

    // якщо ще не було часу — ставимо 120 хв
    if(!localStorage.getItem(blockKey)){
        localStorage.setItem(blockKey, 120 * 60);
    }

    let timeLeft = Number(localStorage.getItem(blockKey));

    timerInterval = setInterval(()=>{

        timeLeft--;

        localStorage.setItem(blockKey, timeLeft);

        let m = Math.floor(timeLeft/60);
        let s = timeLeft % 60;

        document.getElementById("timer").innerText =
            `${m}:${s.toString().padStart(2,'0')}`;

        // 🔴 попередження за 5 хв
        if(timeLeft === 300){
            alert("Залишилось 5 хвилин!");
        }

        // 🔴 червоний таймер за 1 хв
        if(timeLeft <= 60){
            document.getElementById("timer").style.color = "red";
        }

        // ⛔ час вийшов
        if(timeLeft <= 0){
            clearInterval(timerInterval);
            finish();
        }

    },1000);
}

// --------------------
// SUBJECTS
// --------------------
function buildSubjects(){
    let container = document.getElementById("subjects");
    container.innerHTML = "";

    let subs = [...new Set(currentQuestions.map(q=>q.sub))];

    subs.forEach(sub=>{
        let btn=document.createElement("button");
        btn.innerText=sub;

        btn.onclick=()=>{
            currentSubject=sub;
            current=0;
            localStorage.setItem("current",0);
            show();
        };

        container.appendChild(btn);
    });
}

// --------------------
// SHOW
// --------------------
function show(){

    let filtered = currentQuestions.filter(
    q => q.sub.trim().toLowerCase() === currentSubject.trim().toLowerCase()
);
    if(filtered.length===0){
        document.getElementById("question").innerText="Немає питань";
        return;
    }

    if(current>=filtered.length){
        current=0;
    }

    let q = filtered[current];

    // 🔥 subject (новий id)
    document.getElementById("subjectTop").innerText = q.sub;

    let htmlQ = `
    <div style="color:#888; margin-bottom:10px;">
    Завдання ${current+1}
    </div>
    <div style="font-weight:600;">
    ${q.q}
    </div>
    `;

    if(q.img){
        htmlQ += `<br><br><img src="${q.img}" class="question-img">`;
    }

    document.getElementById("question").innerHTML = htmlQ;

    // MATCH
    if(q.type === "match"){

        let lettersFull = ["А","Б","В","Г","Д"];
        let numbersFull = ["1","2","3","4","5"];

        let letters = q.lettered 
            ? numbersFull.slice(0, q.right.length)
            : lettersFull.slice(0, q.right.length);

        let html = `<div class="match-wrapper">`;

        /* 🔹 ВЕРХ: ДВА СТОВПЦІ */
        html += `
        <div class="match-top">

            <div class="match-left-block">
                <b>Вираз:</b><br><br>
                ${q.left.map((item,i)=>{

                let label = q.lettered ? lettersFull[i] : (i+1);
                    return `${label}. ${item}`;
                }).join("<br><br>")}
            </div>

            <div class="match-right-block">
                <b>Проміжок:</b><br><br>
                ${q.right.map((item,i)=>`<b>${letters[i]}</b> ${item}`).join("<br><br>")}
            </div>

        </div>
        `;

        /* 🔹 ТАБЛИЦЯ */
        html += `<div class="match-table">`;

        /* header */
        let headers = q.reverseTable 
            ? ["А","Б","В","Г"] 
            : letters;

        html += `<div class="match-header">
            <div></div>
            ${headers.map(h=>`<div>${h}</div>`).join("")}
        </div>`;

        
        /* rows */
            let rowLabels = q.reverseTable 
                ? numbersFull.slice(0, q.left.length)
                : (q.lettered ? lettersFull.slice(0, q.left.length) : null);
            
                let colLabels = q.reverseTable 
                ? lettersFull.slice(0, q.right.length)
                : letters;

            q.left.forEach((item,i)=>{
                html += `<div class="match-row">

                    <div class="left-item">
                        ${rowLabels ? rowLabels[i] : (i+1)}
                    </div>

                ${colLabels.map(letter=>{
                    let index = colLabels.indexOf(letter);
                    let checked = Number(answers[q.id]?.[i]) === index ? "checked" : "";

                    return `<label class="match-cell">
                        <input type="radio" name="match_${q.id}_${i}" value="${index}" ${checked}>
                    </label>`;
                }).join("")}

            </div>`;
        });

        html += `</div>`;
        html += `</div>`;

        document.getElementById("answers").innerHTML = html;

    }

    // INPUT
    else if(q.type === "input"){
        let value = answers[q.id] || "";
        document.getElementById("answers").innerHTML =
        `<input type="text" id="inputAnswer" value="${value}" placeholder="Введіть відповідь">`;
    }

    else if(q.type === "multiinput"){

        let values = answers[q.id] || ["","",""];

        let html = q.items.map((item,i)=>`${i+1}. ${item}`).join("<br><br>");

        html += `<br><br><b>Впишіть цифри:</b><br><br>`;

        html += values.map((v,i)=>`
            <input type="text" class="multi-input" data-index="${i}" value="${v}" style="width:60px; margin-right:10px;">
        `).join("");

        document.getElementById("answers").innerHTML = html;

        // збереження
        document.querySelectorAll(".multi-input").forEach(input=>{
            input.addEventListener("input", ()=>{
                if(!answers[q.id]) answers[q.id] = ["","",""];
                answers[q.id][input.dataset.index] = input.value;
            });
        });
    }
    // TEST
    else{
        let html="";
        q.a.forEach((ans,i)=>{
            let checked = answers[q.id]==i ? "checked":"";
        html+=`
        <label class="option">
            <input type="radio" name="a" value="${i}" ${checked}>
            <span class="option-text">${ans}</span>
        </label>
        `;            
        
        });

        document.getElementById("answers").innerHTML = html;
    }

    buildGrid(filtered);

        if(window.renderMathInElement){
        renderMathInElement(document.getElementById("question"), {throwOnError:false});
        renderMathInElement(document.getElementById("answers"), {throwOnError:false});
    }

    // 🔥 КНОПКИ
    let prevBtn = document.getElementById("prevBtn");
    let nextBtn = document.getElementById("nextBtn");

    prevBtn.style.display = current === 0 ? "none" : "inline-block";

    let finishBtn = document.getElementById("finishBtn");

    if(current === filtered.length - 1){

        nextBtn.style.display = "none";

        // список предметів у блоці
        let subs = [...new Set(currentQuestions.map(q=>q.sub))];

        let index = subs.findIndex(
            s => s.trim().toLowerCase() === currentSubject.trim().toLowerCase()
        );

        if(index < subs.length - 1){
            // є наступний предмет
            finishBtn.innerText = "Далі → " + subs[index + 1];
        }else{
            // останній предмет
            finishBtn.innerText = "Завершити блок";
        }

    }else{
        nextBtn.style.display = "inline-block";
        finishBtn.innerText = "Завершити блок";
    }
}

// --------------------
// SAVE
// --------------------
function save(){

    let filtered = currentQuestions.filter(
        q => q.sub.trim().toLowerCase() === currentSubject.trim().toLowerCase()
    );
    let q = filtered[current];

            if(q.type === "match"){
                let arr = [];
                q.left.forEach((_, i)=>{
                let options = document.querySelectorAll(`input[name="match_${i}"]`);

                let selected = null;

                options.forEach(opt=>{
                    if(opt.checked){
                        selected = Number(opt.value);
                    }
                });

                arr.push(selected);
            });
                answers[q.id] = arr;
            }

    else if(q.type === "input"){
        answers[q.id] = document.getElementById("inputAnswer").value;
    }
    else{
        let s=document.querySelector('input[name="a"]:checked');
        if(s) answers[q.id]=Number(s.value);
    }

    localStorage.setItem("answers",JSON.stringify(answers));
}

// --------------------
function next(){
    save();

    let filtered = currentQuestions.filter(
        q => q.sub.trim().toLowerCase() === currentSubject.trim().toLowerCase()
    );

    if(current < filtered.length-1){
        current++;
        localStorage.setItem("current",current);
        show();
    }
}

function prev(){
    save();

    if(current>0){
        current--;
        localStorage.setItem("current",current);
        show();
    }
}

// --------------------
// GRID
// --------------------
function buildGrid(filtered){

    let grid=document.getElementById("questionGrid");
    grid.innerHTML="";

    filtered.forEach((q,i)=>{
        let d=document.createElement("div");
        d.className="cell";
        d.innerText=i+1;

        if(answers[q.id]!==undefined){
            d.classList.add("answered");
        }

        if(i===current){
            d.classList.add("current");
        }

        d.onclick=()=>{
            current=i;
            show();
        };

        grid.appendChild(d);
    });
}

function finish(){

    save();

    // 🔥 перевірка пропущених У ВСЬОМУ БЛОЦІ (як в НМТ)
    let unanswered = currentQuestions.filter(q => answers[q.id] === undefined).length;

    if(unanswered > 0){
        let ok = confirm(`Ви не відповіли на ${unanswered} питань. Завершити блок?`);
        if(!ok) return;
    }

    // 🔽 ДАЛІ ТВОЯ ЛОГІКА (НЕ ЧІПАЄМО)

    let subs = [...new Set(currentQuestions.map(q=>q.sub))];

    let index = subs.findIndex(
        s => s.trim().toLowerCase() === currentSubject.trim().toLowerCase()
    );

    // 🔥 якщо є наступний предмет → перейти
    if(index < subs.length - 1){
        currentSubject = subs[index + 1];
        current = 0;

        localStorage.setItem("current", 0);

        show();
        return;
    }

    // 🔥 якщо це вже останній предмет у блоці
    if(block === 1){
        localStorage.setItem("block", 2);
        localStorage.setItem("current", 0);
        location.href = "break.html";
    }
    else{
        location.href = "result.html";
    }
}


document.addEventListener("click", function(e){
    if(e.target.tagName === "IMG"){
        openImage(e.target.src);
    }
});

function openImage(src){
    let modal = document.createElement("div");
    modal.className = "img-modal";

    modal.innerHTML = `
        <div class="img-modal-content">
            <img src="${src}" id="zoomImg">
        </div>
    `;

    document.body.appendChild(modal);

    let img = document.getElementById("zoomImg");

    let scale = 1;
    let pos = {x:0, y:0};
    let dragging = false;
    let start = {x:0, y:0};

    // 🔍 zoom колесом
    modal.addEventListener("wheel", (e)=>{
        e.preventDefault();

        let delta = e.deltaY > 0 ? -0.1 : 0.1;
        scale += delta;

        if(scale < 0.5) scale = 0.5;
        if(scale > 5) scale = 5;

        img.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${scale})`;
    });

    // 🖱 drag
    img.addEventListener("mousedown", (e)=>{
        dragging = true;
        start.x = e.clientX - pos.x;
        start.y = e.clientY - pos.y;
        img.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e)=>{
        if(!dragging) return;
        pos.x = e.clientX - start.x;
        pos.y = e.clientY - start.y;

        img.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${scale})`;
    });

    document.addEventListener("mouseup", ()=>{
        dragging = false;
        img.style.cursor = "grab";
    });

    // ❌ закрити
    modal.onclick = (e)=>{
        if(e.target === modal){
            modal.remove();
        }
    };
}


window.onload = function(){
    if(document.getElementById("result-body")){
        buildResult();
    }
};

function buildResult(){

    let answers = JSON.parse(localStorage.getItem("answers")) || {};

    let result = {
        "Математика": {score:0, max:32},
        "Українська мова": {score:0, max:45},
        "Історія": {score:0, max:54},
        "Англійська мова": {score:0, max:32}
    };

    questions.forEach(q=>{

        
    if(answers[q.id] === undefined) return;

        
        let userAnswer = answers[q.id];


    if(userAnswer === undefined) return;

    let correct = false;

        if(q.type === "match"){

    correct = true;

    for(let i = 0; i < userAnswer.length; i++){

        let userIndex = Number(userAnswer[i]);
        let correctIndex = Number(q.correct[i+1]);

        if(userIndex !== correctIndex){
            correct = false;
            break;
        }
    }
}

        

        else if(q.type === "multiinput"){
            correct = JSON.stringify(userAnswer) === JSON.stringify(q.correct);
        }

        else if(q.type === "input"){

            let user = userAnswer;

            if(typeof user === "string"){
                user = parseFloat(user.replace(",", ".").trim());
            }

            correct = Math.abs(user - q.correct) < 0.01;
        }

        else{
        correct = Number(userAnswer) === Number(q.correct);        }

        if(correct){
            result[q.sub].score += q.points || 1;
        }
    });

    // 🔥 вивід
    let tbody = document.getElementById("result-body");
    tbody.innerHTML = "";

    for(let sub in result){

    let s = result[sub];

    let tr = document.createElement("tr");

    let min = minScores[sub] || 0;

    let status = s.score < min
        ? `<span style="color:#d32f2f;">❌ Не склав</span>`
        : "";

    tr.innerHTML = `
        <td>${sub}</td>
        <td>${s.score} / ${s.max}</td>
        <td>${convertToNMT(sub, s.score)} ${status}</td>
    `;

    tbody.appendChild(tr); // 🔥 ОБОВʼЯЗКОВО
}
}


