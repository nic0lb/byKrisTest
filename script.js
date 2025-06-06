let carrinho = [];

/**
 * Adiciona um item ao carrinho ou aumenta sua quantidade se já existir.
 * @param {string} nome - O nome do produto.
 * @param {number} preco - O preço unitário do produto.
 */
function adicionar(nome, preco) {
  const item = carrinho.find(i => i.nome === nome);
  if (item) {
    item.quantidade += 1;
    item.total = item.quantidade * item.preco;
  } else {
    carrinho.push({ nome, preco, quantidade: 1, total: preco });
  }
  atualizarCarrinho();
}

/**
 * Diminui a quantidade de um item no carrinho. Se a quantidade for 0 ou menos, remove o item.
 * @param {string} nome - O nome do produto a ser diminuído.
 */
function diminuir(nome) {
  const item = carrinho.find(i => i.nome === nome);
  if (item) {
    item.quantidade -= 1;
    if (item.quantidade <= 0) {
      remover(nome);
    } else {
      item.total = item.quantidade * item.preco;
    }
  }
  atualizarCarrinho();
}

/**
 * Remove um item do carrinho.
 * @param {string} nome - O nome do produto a ser removido.
 */
function remover(nome) {
  carrinho = carrinho.filter(i => i.nome !== nome);
  atualizarCarrinho();
}

/**
 * Atualiza a exibição do carrinho no DOM.
 * Esta função foi otimizada para atualizar apenas os elementos necessários,
 * em vez de recriar a lista inteira.
 */
function atualizarCarrinho() {
  const lista = document.getElementById('carrinho');
  let totalGeral = 0;

  // Mapa para acompanhar os itens que já existem no DOM
  const existingItems = new Map();
  Array.from(lista.children).forEach(li => {
    const itemName = li.dataset.itemName;
    if (itemName) {
      existingItems.set(itemName, li);
    }
  });

  // Atualiza ou adiciona itens no DOM
  carrinho.forEach(item => {
    let li = existingItems.get(item.nome);

    if (li) {
      // Se o item já existe, atualiza apenas o texto
      li.querySelector('span:first-child').textContent =
        `${item.nome} - ${item.quantidade}x - R$${item.total.toFixed(2)}`;
      // Remove do mapa, pois já foi processado
      existingItems.delete(item.nome);
    } else {
      // Se o item não existe, cria um novo <li>
      li = document.createElement('li');
      li.dataset.itemName = item.nome; // Adiciona um data attribute para identificação
      li.innerHTML = `
        <span>${item.nome} - ${item.quantidade}x - R$${item.total.toFixed(2)}</span>
        <span>
          <button onclick="adicionar('${item.nome.replace(/'/g, "\\'")}', ${item.preco})">+</button>
          <button onclick="diminuir('${item.nome.replace(/'/g, "\\'")}')">-</button>
          <button onclick="remover('${item.nome.replace(/'/g, "\\'")}')">🗑️</button>
        </span>
      `;
      lista.appendChild(li);
    }
    totalGeral += item.total;
  });

  // Remove itens do DOM que não estão mais no carrinho (restantes no existingItems)
  existingItems.forEach(li => {
    lista.removeChild(li);
  });

  document.getElementById('total').textContent = totalGeral.toFixed(2);
}

/**
 * Envia o resumo do kit para o WhatsApp.
 * Se o carrinho estiver vazio, mostra um alerta.
 */
function enviarWhatsApp() {
  if (carrinho.length === 0) {
    showAlert("Seu kit está vazio!");
    return;
  }

  const numero = "5585981251110"; // número do WhatsApp (sem traços ou espaços)
  const pedido = carrinho
    .map(i => `• ${i.nome} - ${i.quantidade}x - R$${i.total.toFixed(2)}`)
    .join('\n');

  const total = carrinho.reduce((acc, item) => acc + item.total, 0);
  const mensagem = encodeURIComponent(
    `Olá! Gostaria de montar o seguinte kit:\n\n${pedido}\n\nTotal: R$${total.toFixed(2)}`
  );

  const url = `https://wa.me/${numero}?text=${mensagem}`;
  window.open(url, '_blank');
}

/**
 * Mostra a categoria de produtos selecionada e esconde as outras.
 * Atualiza o estilo dos botões das abas.
 * @param {string} categoriaId - O ID da categoria a ser mostrada.
 */
function mostrarCategoria(categoriaId) {
  // Esconde todas as categorias e remove a classe 'active'
  document.querySelectorAll('.categoria').forEach(cat => {
    cat.classList.remove('active');
  });

  // Mostra só a categoria clicada adicionando a classe 'active'
  const ativa = document.getElementById(categoriaId);
  if (ativa) {
    ativa.classList.add('active');
  }

  // Atualiza os botões de aba (remove 'ativa' de todos e adiciona ao clicado)
  document.querySelectorAll('.abas button').forEach(botao => {
    botao.classList.remove('ativa');
  });

  const botaoAtivo = document.querySelector(`.abas button[onclick="mostrarCategoria('${categoriaId}')"]`);
  if (botaoAtivo) {
    botaoAtivo.classList.add('ativa');
  }
}

/**
 * Exibe o modal de alerta personalizado com uma mensagem.
 * @param {string} message - A mensagem a ser exibida no alerta.
 */
function showAlert(message) {
  document.getElementById('alertMessage').textContent = message;
  document.getElementById('customAlert').style.display = 'flex'; // Usa flex para centralizar
}

/**
 * Esconde o modal de alerta personalizado.
 */
function closeAlert() {
  document.getElementById('customAlert').style.display = 'none';
}

// Inicializa a primeira categoria ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  mostrarCategoria('cartoes');
  atualizarCarrinho(); // Garante que o total inicial seja 0.00
});
