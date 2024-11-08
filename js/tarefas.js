const API_URL = "http://localhost:3000/tasks";

document.getElementById("btnAddTarefa").addEventListener("click", function() {
    let nomeTarefa = document.getElementById("inputNovaTarefa").value;
    let custoTarefa = document.getElementById("inputCusto").value;
    let dataLimite = document.getElementById("inputDataLimite").value;

    if (nomeTarefa && custoTarefa && dataLimite) {
        // Gerar ID e Ordem automaticamente
        let idTarefa = Date.now(); // Exemplo: timestamp como ID único
        let ordemTarefa = document.querySelectorAll("#listaTarefas li").length + 1;

        // Formatar a data no formato dia/mês/ano
        let data = new Date(dataLimite);
        let dataFormatada = data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        // Adicionar nova tarefa na lista
        let lista = document.getElementById("listaTarefas");
        let tarefaItem = document.createElement("li");
        tarefaItem.setAttribute("data-id", idTarefa);
        tarefaItem.innerHTML = `
            <div class="tarefa" style="background-color: ${custoTarefa >= 1000 ? 'yellow' : 'transparent'}">
                <div class="tarefa-text">
                    <span>${nomeTarefa}</span>
                    <span>R$ ${parseFloat(custoTarefa).toFixed(2)}</span>
                    <span>${dataFormatada}</span>
                    <span class="ordem">${ordemTarefa}</span>
                </div>
                <div class="tarefa-btn">  
                    <button class="editar" onclick="editarTarefa(${idTarefa})"><i class="fa fa-edit"></i></button>
                    <button class="excluir" onclick="excluirTarefa(${idTarefa})"><i class="fa fa-trash"></i></button>
                </div>
             </div>
        `;
        lista.appendChild(tarefaItem);

        // Limpar campos
        document.getElementById("inputNovaTarefa").value = '';
        document.getElementById("inputCusto").value = '';
        document.getElementById("inputDataLimite").value = '';
    } else {
        alert("Por favor, preencha todos os campos.");
    }
});

function editarTarefa(id) {
    // Buscar tarefa pelo ID
    let tarefa = document.querySelector(`li[data-id='${id}']`);
    let nome = tarefa.querySelector("span").innerText;
    let custo = tarefa.querySelectorAll("span")[1].innerText.replace("R$ ", "").replace(",", ".");
    let dataLimite = tarefa.querySelectorAll("span")[2].innerText;

    // Abrir a janela de edição
    document.getElementById("janelaEdicao").classList.add("abrir");
    document.getElementById("janelaEdicaoFundo").classList.add("abrir");

    // Exibir dados atuais da tarefa nos campos de edição
    document.getElementById("inputTarefaNomeEdicao").value = nome;
    document.getElementById("inputTarefaCustoEdicao").value = parseFloat(custo).toFixed(2);
    document.getElementById("inputTarefaDataEdicao").value = dataLimite.split('/').reverse().join('-'); // Formato ISO para input

    // Atualizar o evento de salvar a tarefa editada
    document.getElementById("btnAtualizarTarefa").onclick = function() {
        atualizarTarefa(id);
    };
}

function atualizarTarefa(id) {
    // Obter novos valores dos campos de edição
    let novoNome = document.getElementById("inputTarefaNomeEdicao").value;
    let novoCusto = document.getElementById("inputTarefaCustoEdicao").value;
    let novaData = document.getElementById("inputTarefaDataEdicao").value;

    // Encontrar a tarefa na lista e atualizar os valores
    let tarefa = document.querySelector(`li[data-id='${id}']`);
    let tarefaTexto = tarefa.querySelector(".tarefa-text");
    tarefaTexto.children[0].innerText = novoNome;
    tarefaTexto.children[1].innerText = `R$ ${parseFloat(novoCusto).toFixed(2)}`;
    
    // Atualizar a data para o formato pt-BR
    let dataFormatada = new Date(novaData).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    tarefaTexto.children[2].innerText = dataFormatada;

    // Fechar a janela de edição
    document.getElementById("janelaEdicao").classList.remove("abrir");
    document.getElementById("janelaEdicaoFundo").classList.remove("abrir");
}

function tarefaJaExiste(nome) {
    let tarefas = document.querySelectorAll("#listaTarefas li");
    for (let tarefa of tarefas) {
        if (tarefa.querySelector("span").innerText === nome) {
            return true;
        }
    }
    return false;
}

function excluirTarefa(id) {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
        let tarefa = document.querySelector(`li[data-id='${id}']`);
        tarefa.remove();
    }
}

function adicionarBotoesDeReordenacao(tarefaItem) {
    let subirBtn = document.createElement("button");
    subirBtn.classList.add("subir");
    subirBtn.innerHTML = "▲";
    subirBtn.onclick = function() {
        let tarefaAnterior = tarefaItem.previousElementSibling;
        if (tarefaAnterior) {
            tarefaItem.parentNode.insertBefore(tarefaItem, tarefaAnterior);
        }
    };

    let descerBtn = document.createElement("button");
    descerBtn.classList.add("descer");
    descerBtn.innerHTML = "▼";
    descerBtn.onclick = function() {
        let tarefaProxima = tarefaItem.nextElementSibling;
        if (tarefaProxima) {
            tarefaItem.parentNode.insertBefore(tarefaProxima, tarefaItem);
        }
    };

    tarefaItem.appendChild(subirBtn);
    tarefaItem.appendChild(descerBtn);
}

const taskList = document.getElementById('listaTarefas'); // Atualize para 'listaTarefas'

// Inicialize o SortableJS
Sortable.create(taskList, {
    animation: 150,
    onEnd: function(event) {
        // Função chamada ao soltar o item
        // Você pode atualizar a ordem das tarefas no backend aqui
        console.log('Item arrastado de', event.oldIndex, 'para', event.newIndex);
    }
});

async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        // Verifique se a resposta tem uma propriedade chamada 'tasks'
        const tasks = Array.isArray(data) ? data : data.tasks;

        // Atualize a lista de tarefas no frontend
        renderTasks(tasks);
    } catch (error) {
        console.error("Erro ao buscar as tarefas:", error);
    }
}

async function addTask(taskTitle) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ title: taskTitle }),
        });
        const newTask = await response.json();
        // Adicione a nova tarefa à lista no frontend
        renderTask(newTask);
    } catch (error) {
        console.error("Erro ao adicionar a tarefa:", error);
    }
}

async function updateTask(taskId, updatedData) {
    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),
        });
        const updatedTask = await response.json();
        // Atualize a tarefa no frontend
        renderUpdatedTask(updatedTask);
    } catch (error) {
        console.error("Erro ao atualizar a tarefa:", error);
    }
}

async function deleteTask(taskId) {
    try {
        await fetch(`${API_URL}/${taskId}`, {
            method: "DELETE",
        });
        // Remova a tarefa da lista no frontend
        removeTaskFromUI(taskId);
    } catch (error) {
        console.error("Erro ao excluir a tarefa:", error);
    }
}
// Função para buscar as tarefas
function fetchTasks() {
    fetch('http://localhost:3000/tarefas') // Ajuste o caminho conforme necessário
        .then(response => response.json())
        .then(data => {
            // Verifique o que está sendo retornado pela API
            console.log(data);
            if (Array.isArray(data)) {
                renderTasks(data);  // Renderiza se for um array
            } else {
                console.error("A resposta da API não é um array válido.");
            }
        })
        .catch(error => console.error("Erro ao buscar tarefas:", error));
}

// Função para renderizar as tarefas
function renderTasks(tasks) {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = ""; // Limpa a lista antes de adicionar novas tarefas

    tasks.forEach(task => {
        // Garantir que as propriedades existam antes de renderizar
        const title = task.title || "Sem título"; // Usar "Sem título" se não houver título
        const custo = task.custo || "Sem custo"; // Usar "Sem custo" se não houver custo
        const dataLimite = task.dataLimite || "Sem data"; // Usar "Sem data" se não houver dataLimite

        const taskItem = document.createElement("div");
        taskItem.classList.add("task-item");

        taskItem.innerHTML = `
            <div class="task-text">
                <span>${title}</span>
                <span>${custo}</span>
                <span>${dataLimite}</span>
            </div>
        `;
        taskList.appendChild(taskItem);
    });
}

// Chame a função para buscar as tarefas ao carregar a página
fetchTasks();
