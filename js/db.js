import { openDB } from "idb";

let db;

// Função para criar o banco de dados
async function createDB() {
    try {
        db = await openDB('banco', 1, {
            upgrade(db, oldVersion, newVersion, transaction) {
                switch (oldVersion) {
                    case 0:
                    case 1:
                    // Cria a store 'pessoas' com 'nome' como chave primária
                    const store = db.createObjectStore('pessoas', {
                        keyPath: 'nome' // Usando 'nome' como chave primária
                    });
                    // Criando um índice 'id' para a store
                    store.createIndex('id', 'id');
                    showResult("Banco de dados criado!");
                }
            }
        });
        showResult("Banco de dados aberto.");
    } catch (e) {
        showResult("Erro ao criar o banco de dados: " + e.message);
    }
}

// Evento de carregamento da página
window.addEventListener("DOMContentLoaded", async event => {
    await createDB(); // Cria ou abre o banco de dados

    // Adicionando eventos aos botões
    document.getElementById("input")
    document.getElementById("btnSalvar").addEventListener("click", addData);
    document.getElementById("btnListar").addEventListener("click", getData);
});

// Função para adicionar dados no banco de dados
async function addData() {
    const nome = document.getElementById('nome').value;
    const idade = document.getElementById('idade').value;

    // Verifica se os campos nome e idade não estão vazios
    if (!nome || !idade) {
        showResult("Por favor, preencha ambos os campos!");
        return;
    }

    const tx = await db.transaction('pessoas', 'readwrite');
    const store = tx.objectStore('pessoas'); // Acessa a store existente
    try {
        await store.add({ nome: nome, idade: idade });
        await tx.done;
        limparCampos();
    } catch (error) {
        showResult(error)
        limparCampos();
    }

    };

// Função para listar os dados salvos no banco de dados
async function getData() {
    if (db == undefined) {
        showResult("O banco de dados está fechado.");
        return;
    }

    const tx = await db.transaction('pessoas', 'readonly');
    const store = tx.objectStore('pessoas'); // Acessa a store existente
    const value = await store.getAll(); // Obtém todos os registros

    if (value) {
       showResult("Dados do banco: " + JSON.stringify(value.map((a) => {
        <div>
            <p>Nome: {a.nome}</p>
            <p>Idade:{a.idade} anos</p>
        </div>
       })))
    } else {
        showResult("Não há dados cadastrados.");
    }
}

// Função para exibir os resultados na tela
function showResult(text) {
    document.querySelector("output").innerHTML = text;
}

function limparCampos() {
    document.getElementById("nome").value = "";
    document.getElementById("idade").value = "";

}
