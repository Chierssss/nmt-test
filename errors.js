let answers = JSON.parse(localStorage.getItem("answers") || "{}");

function showErrors(subject){

    let container = document.getElementById("errorsList");
    container.innerHTML = "";

    let filtered = questions.filter(
        q => q.sub.trim().toLowerCase() === subject.trim().toLowerCase()
    );

    let hasErrors = false;

    filtered.forEach(q => {

        let userAnswer = answers[q.id];

        if(userAnswer === undefined) return;

        let correct = false;

        // 🔥 перевірка (розумна)
        if(q.type === "match"){

    correct = true;

    for(let i = 0; i < userAnswer.length; i++){

        let userIndex = Number(userAnswer[i]); // тепер це число
        let correctIndex = q.correct[i+1];

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
            correct = Number(userAnswer) === Number(q.correct);
        }

        if(!correct){

            hasErrors = true;

            let div = document.createElement("div");
            div.className = "card";
            div.style.marginTop = "15px";

            div.innerHTML = `
                <div style="margin-bottom:10px;"><b>Питання:</b></div>
                <div>${q.q}</div>

                <div style="margin-top:10px; color:#d32f2f;">
                    ❌ Твоя відповідь: ${formatAnswer(q, userAnswer)}
                </div>

                <div style="color:green;">
                    ✔ Правильна: ${formatAnswer(q, q.correct)}
                </div>
            `;

            container.appendChild(div);
        }
    });

    if(!hasErrors){
        container.innerHTML = "<p>Немає помилок 🎉</p>";
    }
}

function formatAnswer(q, ans){

    if(ans === undefined) return "немає";

    if(q.type === "match"){

        let letters = ["А","Б","В","Г","Д"];

        // якщо це твоя відповідь (масив індексів)
        if(Array.isArray(ans)){
            return ans.map(i => letters[i]).join(", ");
        }

        // якщо це правильна відповідь (object)
        if(typeof ans === "object"){
            let arr = [];
            for(let i = 1; i <= Object.keys(ans).length; i++){
                arr.push(letters[ans[i]]);
            }
            return arr.join(", ");
        }
    }

    // multiinput
    if(q.type === "multiinput"){
        return ans.join(", ");
    }

    // input
    if(q.type === "input"){
        return ans;
    }

    // тест
    if(q.a){
        return q.a[ans];
    }

    return ans;
}
