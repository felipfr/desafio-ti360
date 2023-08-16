// Obtem os elementos do HTML
const form = document.getElementById("myForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const cepInput = document.getElementById("cep");
const cepErrorMsg = document.getElementById("cep-error");
const streetInput = document.getElementById("street");
const complementInput = document.getElementById("complement");
const neighborhoodInput = document.getElementById("neighborhood");
const cityInput = document.getElementById("city");
const stateInput = document.getElementById("state");
const submitButton = document.getElementById("submitButton");

// Função para validar os inputs
function validateAndUpdate(inputElement, isValid) {
  // Alterna entre a classe de erro e sucesso com base na validação
  inputElement.classList.toggle("error", !isValid);
  inputElement.classList.toggle("success", isValid);

  // Verifica se todos os campos de entrada estão válidos
  const inputs = [
    nameInput,
    emailInput,
    phoneInput,
    cepInput,
    streetInput,
    complementInput,
    neighborhoodInput,
    cityInput,
    stateInput,
  ];

  const allInputsValid = inputs.every(
    (input) =>
      // Verifica se o valor do campo de entrada não está vazio após remover espaços em branco
      input.value.trim() !== "" &&
      // Verifica se o campo de entrada não possui a classe 'error'
      !input.classList.contains("error")
  );

  // Desabilita ou habilita o botão de envio com base na validade de todos os campos
  submitButton.disabled = !allInputsValid;
}

// Adiciona os listeners para os campos que não precisam de formatação especial
[nameInput, complementInput].forEach((input) => {
  input.addEventListener("input", () => {
    validateAndUpdate(input, input.value.trim() !== "");
  });
});

// Verifica o campo de email em tempo real
emailInput.addEventListener("input", () => {
  // Valida o formato do email usando uma expressão regular
  const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
    emailInput.value
  );
  // Valida o campo de email e atualiza sua aparência
  validateAndUpdate(emailInput, isEmailValid);
});

// Verifica campo de telefone em tempo real
phoneInput.addEventListener("input", () => {
  // Remove os caracteres não numéricos
  const value = phoneInput.value.replace(/\D/g, "");

  phoneInput.value = value;

  // Valida o número de telefone com base na quantidade de dígitos
  const isPhoneValid = /^\d{10,11}$/.test(value);

  // Formata o número de telefone se ele for válido
  if (isPhoneValid) {
    const formattedValue = value.replace(
      /^(\d{2})(\d{4,5})(\d{4})$/,
      "($1) $2-$3"
    );
    phoneInput.value = formattedValue; // Atualiza o valor do campo com o valor formatado
  }

  // Valida o campo de telefone e atualiza sua aparência
  validateAndUpdate(phoneInput, isPhoneValid);
});

// Verifica o campo de CEP em tempo real
cepInput.addEventListener("input", () => {
  // Função assíncrona para lidar com a entrada de CEP
  async function handleCepInput() {
    // Remove os caracteres não numéricos do valor do campo de CEP
    const value = cepInput.value.replace(/\D/g, "");

    // Formata o valor para o padrão XXXXX-XXX
    const formattedValue = value.replace(/^(\d{5})(\d{3})$/, "$1-$2");
    cepInput.value = formattedValue;

    // Verifica se o formato do CEP é válido
    const isFormatValid = /\d{5}-\d{3}/.test(formattedValue);

    if (isFormatValid) {
      try {
        // Tenta buscar informações do CEP na API
        const response = await fetch(
          `https://brasilapi.com.br/api/cep/v1/${formattedValue}`
        );
        const data = await response.json();

        if (response.ok) {
          // Preenche os campos com os dados obtidos
          streetInput.value = data.street;
          neighborhoodInput.value = data.neighborhood;
          cityInput.value = data.city;
          stateInput.value = data.state;

          // Desabilita o campo de CEP
          cepInput.disabled = true;

          // Limpa a mensagem de erro (se houver)
          cepErrorMsg.textContent = "";
        } else {
          // Exibe uma mensagem de erro ao usuário se o CEP não válido
          cepErrorMsg.textContent = "CEP incorreto ou não encontrado";
        }

        // Valida o CEP com base na resposta da API
        const isCepResponseValid = isFormatValid && response.ok;

        // Valida o campo de CEP e atualiza sua aparência
        validateAndUpdate(cepInput, isCepResponseValid);
      } catch (error) {
        // Log de erro em caso de falha na busca da API
        console.error("Erro ao buscar o endereço:", error);
      }
    } else {
      // Limpa mensagem de erro (se houver) e valida o campo de CEP com formato inválido
      cepErrorMsg.textContent = "";
      validateAndUpdate(cepInput, false);
    }
  }
  // Chama a função assíncrona de tratamento do CEP
  handleCepInput();
});

// Função para armazenar os dados do formulário no localStorage
function storeFormData() {
  const formData = {
    name: nameInput.value,
    email: emailInput.value,
    phone: phoneInput.value,
    cep: cepInput.value,
    street: streetInput.value,
    complement: complementInput.value,
    neighborhood: neighborhoodInput.value,
    city: cityInput.value,
    state: stateInput.value,
  };

  localStorage.setItem("formData", JSON.stringify(formData));
}

// Adiciona um event listener ao formulário para capturar o envio
form.addEventListener("submit", (ev) => {
  // Evita o comportamento padrão de envio do formulário
  ev.preventDefault();

  // Exibe o popup do SweetAlert enquanto o formulário é enviado
  Swal.fire({
    title: "Formulário Enviado com Sucesso!",
    icon: "success",
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
  });

  // Armazena os dados do formulário no localStorage
  storeFormData();

  // Limpa todos os campos do formulário
  form.reset();

  // Remove as classes de sucesso de todos os campos
  const inputs = form.querySelectorAll("input");
  inputs.forEach((input) => {
    input.classList.remove("success");
  });

  // Retorna o botão de envio para o estado "disabled"
  submitButton.disabled = true;

  // Aguarda o tempo definido no timer do SweetAlert (3000 ms) e, em seguida, recarrega a página
  setTimeout(() => {
    location.reload();
  }, 3000);
});

// Função para preencher os campos com os dados do localStorage
document.addEventListener("DOMContentLoaded", () => {
  // Obtem a div onde os dados do LocalStorage serão exibidos
  const localStorageDataDiv = document.getElementById("localStorageData");

  // Obtem os dados do formulário armazenados no LocalStorage
  const formDataJSON = localStorage.getItem("formData");

  if (formDataJSON) {
    // Se houver dados no LocalStorage, processa e exibe os dados
    const formData = JSON.parse(formDataJSON);

    // Cria um título de cabeçalho para os dados armazenados
    const heading = document.createElement("h3");
    heading.textContent = "Dados armazenados no LocalStorage:";
    heading.style.marginBottom = "10px";
    localStorageDataDiv.appendChild(heading);

    // Cria uma lista para exibir os dados
    const dataList = document.createElement("ul");

    // Mapeia os rótulos para os campos do formulário
    const labels = {
      name: "Nome",
      email: "E-mail",
      phone: "Telefone",
      cep: "CEP",
      street: "Rua",
      complement: "Complemento",
      neighborhood: "Bairro",
      city: "Cidade",
      state: "Estado",
    };

    // Itera sobre os campos do formulário e cria elementos para exibição
    for (const field in formData) {
      const label = labels[field] || field;
      const fieldText = `${formData[field]}`;
      const listItem = document.createElement("p");
      listItem.textContent = fieldText;

      // Se houver um rótulo correspondente, cria um elemento <span> em negrito para o rótulo
      if (labels[field]) {
        const labelSpan = document.createElement("span");
        labelSpan.textContent = `${label}: `;
        labelSpan.style.fontWeight = "bold";
        listItem.insertBefore(labelSpan, listItem.firstChild);
      }

      // Adiciona o item à lista
      dataList.appendChild(listItem);
    }

    // Adiciona a lista de dados ao elemento HTML
    localStorageDataDiv.appendChild(dataList);
  } else {
    // Se não houver dados no LocalStorage, exibe uma mensagem
    const noDataMessage = document.createElement("p");
    noDataMessage.textContent = "Nenhum dado armazenado em LocalStorage";
    localStorageDataDiv.appendChild(noDataMessage);
  }
});
