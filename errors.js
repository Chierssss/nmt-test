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
        let correctIndex = q.correct[i];
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

    // MATCH
    if(q.type === "match"){

        let letters = ["А","Б","В","Г","Д"];

        return ans.map((v,i)=>{

            if(v === null || v === undefined){
                return `${i+1} — ?`;
            }

            return `${i+1} — ${letters[v]}`;

        }).join(", ");
    }

    // MULTIINPUT
    if(q.type === "multiinput"){
        return ans.join(", ");
    }

    // INPUT
    if(q.type === "input"){
        return ans;
    }

    // TEST
    if(q.a){
        return q.a[ans];
    }

    return ans;
}

function printAllErrors(){

    let container = document.getElementById("errorsList");

    container.innerHTML = "";

    let subjects = [
        "Математика",
        "Українська мова",
        "Історія",
        "Англійська мова"
    ];

    subjects.forEach(subject=>{

        let title = document.createElement("h2");
        title.innerText = subject;
        title.style.marginTop = "30px";

        container.appendChild(title);

        let filtered = questions.filter(
            q => q.sub.trim().toLowerCase() === subject.trim().toLowerCase()
        );

        filtered.forEach((q,index)=>{

            let userAnswer = answers[q.id];

            if(userAnswer === undefined) return;

            let correct = false;

            // MATCH
            if(q.type === "match"){

                correct = true;

                for(let i = 0; i < q.correct.length; i++){

                    if(Number(userAnswer[i]) !== Number(q.correct[i])){
                        correct = false;
                        break;
                    }
                }
            }

            // MULTIINPUT
            else if(q.type === "multiinput"){

                let user = [...userAnswer]
                    .map(v => v.trim())
                    .sort();

                let corr = [...q.correct]
                    .map(v => v.trim())
                    .sort();

                correct = JSON.stringify(user) === JSON.stringify(corr);
            }

            // INPUT
            else if(q.type === "input"){

                let user = userAnswer;

                if(typeof user === "string"){
                    user = parseFloat(user.replace(",", ".").trim());
                }

                correct = Math.abs(user - q.correct) < 0.01;
            }

            // TEST
            else{
                correct = Number(userAnswer) === Number(q.correct);
            }

            if(!correct){

                let div = document.createElement("div");
                div.className = "card";
                div.style.marginTop = "15px";

                div.innerHTML = `
                    <div style="margin-bottom:10px;">
                        <b>Питання ${index + 1}</b>
                    </div>

                    <div>${q.q}</div>

                    <div style="margin-top:10px; color:#d32f2f;">
                        ❌ Твоя відповідь:
                        ${formatAnswer(q, userAnswer)}
                    </div>

                    <div style="color:green;">
                        ✔ Правильна:
                        ${formatAnswer(q, q.correct)}
                    </div>
                `;

                container.appendChild(div);
            }
        });
    });
}

async function downloadErrorsPDF(){

    // показати всі помилки
    printAllErrors();

    document.body.style.background = "white";

    await new Promise(resolve => setTimeout(resolve, 1500));

    const element = document.querySelector(".start-card");
    element.style.opacity = "1";
    element.style.filter = "none";
    element.style.transform = "none";

    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();

    const pdfHeight =
        (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pdfWidth,
        pdfHeight
    );

    pdf.save("Помилки_НМТ.pdf");
}
